// Utenti App — la scheda (UtenteDrawer) e i suoi attrezzi; la lista di
// sezione non esiste più, si arriva qui dalla rubrica Contatti.
// SpesaMediaCard resta: la monta Analisi Dati (admin-dashboard).

const { useState: useStateUtn } = React;


// ─── Spesa media card · period-aware ────────────────────────────────────────
// Risolve l'ambiguità: ogni KPI di spesa ha un orizzonte temporale esplicito.
// Lifetime = somma totale dall'iscrizione; 12 mesi = annualizzata; 30 giorni =
// proiezione mensile basata sull'orizzonte medio dei dati raccolti.
function SpesaMediaCard({ lifetime, anno, mese, horizonDays }) {
  const [periodo, setPeriodo] = useStateUtn('lifetime');
  const opts = [
    { id:'lifetime', label:'Lifetime', shortHelp:`dall'iscrizione (Ø ${horizonDays}gg)`, value:lifetime },
    { id:'anno',     label:'12 mesi',  shortHelp:'annualizzata',                          value:anno },
    { id:'mese',     label:'30 gg',    shortHelp:'mensile media',                          value:mese },
  ];
  const cur = opts.find(o => o.id === periodo) || opts[0];

  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
        <div style={{minWidth:0, flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
            <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em'}}>Spesa media / utente</div>
            <span style={{
              fontSize:13, fontWeight:800, color:ADM.OK, background:ADM.OK_SOFT,
              padding:'2px 6px', borderRadius:4, letterSpacing:'0.06em', textTransform:'uppercase',
            }}>{cur.label}</span>
          </div>
          <div style={{fontSize:26.6, fontWeight:700, color:ADM.TEXT, marginTop:8, letterSpacing:'-0.03em', lineHeight:1.05}}>
            {fmtEur(cur.value)}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:8}}>Da ordini in app · {cur.shortHelp}</div>
        </div>
        <div style={{
          width:38, height:38, borderRadius:11,
          background: ADM.OK_SOFT, color: ADM.OK,
          display:'grid', placeItems:'center',
          boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.4)', flexShrink:0,
        }}>
          <BuIcons.card size={23}/>
        </div>
      </div>

      {/* Period switcher · Apple segmented control */}
      <div style={{
        display:'inline-flex', marginTop:12, padding:2,
        background:'#F0F1F3', borderRadius:7,
      }}>
        {opts.map(o => {
          const active = o.id === periodo;
          return (
            <button key={o.id} onClick={()=>setPeriodo(o.id)} style={{
              padding:'4px 10px', fontSize:12.6, fontWeight:700,
              background: active ? '#fff' : 'transparent',
              color: active ? ADM.OK : ADM.MUTED,
              border:'none', borderRadius:5, cursor:'pointer',
              fontFamily:'inherit', letterSpacing:'0.02em',
              boxShadow: active ? '0 1px 2px rgba(15,17,21,0.08)' : 'none',
              transition:'all 0.15s',
            }}>{o.label}</button>
          );
        })}
      </div>
    </AdmCard>
  );
}

// La riga della vecchia lista (UtenteRow) e la pagina di sezione
// (AdmUtentiPage) sono state rimosse: la rotta è tradotta in Contatti.

// ─── Il registro d'uso dell'app (P-37 · D-31) ───────────────────────────────
// app_usage_events porta tre soli valori, «e sono i tre che non si ricavano
// da altre tabelle: gli altri otto sono proiezioni di fatti già registrati, e
// una seconda scrittura dello stesso fatto è una seconda verità destinata a
// divergere». Ordini, pagamenti, prenotazioni, recensioni, byuppini, notifiche
// e consensi si leggono dalle loro tabelle — cioè dalle altre tab della scheda
// — e la tab Log ci rimanda. Il registro si scrive solo con l'interruttore dei
// suggerimenti acceso, senza indirizzo di rete, coordinate né impronte del
// dispositivo, con la città come solo contesto di luogo. L'interruttore che
// condiziona la scrittura esiste nell'app dal 2026-09-03 (P-26 · D-28, in
// «I miei dati»: suggerimenti e analisi d'uso sotto un interruttore solo,
// ByupUso in app/byup-app-kit.jsx), e da lì gli eventi si scrivono solo se è
// acceso (P-38 · D-31).
// La tab mostra la chiave tecnica in chiaro — la stessa degli export e di
// Analisi Dati. Solo l'etichetta, niente icone o colori: è un log, si
// scandisce per testo e data.
const UTN_EVENTI = {
  app_open:  { label: 'Apertura app' },
  qr_scan:   { label: 'QR scansionato' },
  menu_view: { label: 'Menu sfogliato' },
};

// Le durate si leggono come le dice un umano: secondi fino al minuto, minuti
// con la coda in secondi fino all'ora, poi ore e minuti. «4 min 20 s», non
// «260 s» né «0,07 h».
function utnDurata(sec) {
  if (sec < 60) return Math.round(sec) + ' s';
  if (sec < 3600) {
    const m = Math.floor(sec / 60), s = Math.round(sec % 60);
    return s ? m + ' min ' + s + ' s' : m + ' min';
  }
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? h + ' h ' + m + ' min' : h + ' h';
}

// Una spesa MEDIA si legge al centesimo (fmtEur taglia i decimali, e una
// media da «€ 23» non è una media).
const utnEur2 = (n) => n == null ? '—'
  : '€ ' + new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ─── Le statistiche derivate di un utente — UNA formula sola ────────────────
// Le usa la scheda per i suoi numeri e le usa il calcolo delle mediane qui
// sotto: se vivessero in due posti, prima o poi divergerebbero e il
// confronto confronterebbe cose diverse.
// Niente durata di sessione né conteggio delle sessioni (P-147):
// app_usage_events porta tre soli eventi — apertura, scansione, apertura del
// menù — e nessuna chiusura, quindi quella durata non la produce nessun fatto
// registrato; e la minimizzazione è una scelta (LIA), non una dimenticanza.
// Il tempo dentro l'app, poi, per Byup dice il contrario di quel che sembra:
// chi sta dieci minuti in un menù non trova quel che cerca.
function utnStatDerivate(x) {
  const s = hubSeme(x.id) % 1000;
  const r = (n) => ((s * (n + 1) * 9301 + 49297) % 233280) / 233280;
  const etaGiorniAccount = Math.max(1, (Date.now() - x.dataRegistrazione.getTime()) / 86400000);
  return {
    etaGiorniAccount,
    tempoOrdine: (2 + r(302) * 6) * 60,                  // 2–8 min dal menu all'invio
    // A quest'ordine di grandezza i secondi sono rumore: minuti interi.
    tempoPagamento: Math.round(25 + r(303) * 70) * 60,   // 25–95 min dall'ordine al conto
    tempoPrenotazione: 40 + r(304) * 140,                // 40 s – 3 min in sessione
    spesaMedia: x.ordini ? x.spesaTotale / x.ordini : null,
    // Le annue: il totale VERO del dataset riportato a 12 mesi sull'età
    // dell'account.
    prenAnno: etaGiorniAccount > 365 ? Math.round(x.prenotazioni * (365 / etaGiorniAccount)) : x.prenotazioni,
  };
}

// ─── Le mediane della base utenti ───────────────────────────────────────────
// Il metro accanto ai numeri della tab Statistiche: 41 € di spesa media è
// tanto o poco? Senza un metro sono anagrafe di numeri, non uno strumento.
// Si calcolano una volta sola, su tutta la base, con la STESSA formula.
const UTN_MEDIANE = (() => {
  const med = (arr) => {
    const v = arr.filter(x => x != null).sort((a, b) => a - b);
    if (!v.length) return null;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  };
  const righe = (typeof UTENTI !== 'undefined' ? UTENTI : []).map(utnStatDerivate);
  return {
    spesaMedia: med(righe.map(x => x.spesaMedia)),
    prenAnno: med(righe.map(x => x.prenAnno)),
  };
})();

// `pieno`: stessa scheda ma a pagina intera, senza velo né finestra centrata
// — riempie il posto che la rotta Contatti le dà, e a chiudere ci pensa la
// barra «torna» del chiamante.
function UtenteDrawer({ utente: u, onClose, pieno, onDiario }) {
  const [tab, setTab] = useStateUtn('anagrafica');

  // ── Mock stabili derivati dal seed utente (campi non ancora nel dataset) ──
  // Il seme è l'hash dell'ID INTERO (hubSeme): la vecchia formula leggeva due
  // caratteri soli, e sugli id 'U20xx' uno dei due è uguale per tutti —
  // restavano cinque semi in croce, utenti fotocopia ogni dieci, e certi rami
  // derivati (il consenso A3, per dire) non uscivano MAI per nessuno.
  const seed = hubSeme(u.id) % 1000;
  const rnd = (n) => ((seed * (n+1) * 9301 + 49297) % 233280) / 233280;
  if (u.byuppini === undefined) u.byuppini = 20 + (seed % 380);
  if (u.dataNascita === undefined) {
    const y = new Date().getFullYear() - u.eta;
    u.dataNascita = `${y}-${String(1 + (seed % 12)).padStart(2,'0')}-${String(1 + (seed % 28)).padStart(2,'0')}`;
  }
  if (u.verificato === undefined) u.verificato = seed % 3 !== 0;

  // ── Form anagrafica (editabile con salvataggio) ──
  const formDa = (x) => ({
    nome: x.nome, email: x.email, tel: x.tel, citta: x.citta, regione: x.regione,
    dataNascita: x.dataNascita, sesso: x.sesso, verificato: x.verificato,
  });
  const [form, setForm] = useStateUtn(formDa(u));
  const dirty = form.nome !== u.nome || form.email !== u.email || form.tel !== u.tel
    || form.citta !== u.citta || form.regione !== u.regione || form.dataNascita !== u.dataNascita
    || form.sesso !== u.sesso || form.verificato !== u.verificato;
  const [saved, setSaved] = useStateUtn(false);
  // Cambio utente a scheda montata (⌘K sopra un drawer aperto: la rotta non
  // cambia e React riusa l'istanza): senza reset testata e form restano del
  // precedente, e un «Salva» scriverebbe l'anagrafica di uno addosso
  // all'altro. Stesso giro del gemello StaffDrawer.
  React.useEffect(() => { setTab('anagrafica'); setForm(formDa(u)); setSaved(false); }, [u.id]);
  const etaCalcolata = (() => {
    const d = new Date(form.dataNascita);
    if (isNaN(d)) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 86400000)));
  })();
  const saveForm = () => {
    // L'età resta il campo derivato usato da lista e filtri: la teniamo in sync.
    Object.assign(u, { ...form, eta: etaCalcolata ?? u.eta });
    setSaved(true); setTimeout(()=>setSaved(false), 2200);
  };
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target ? e.target.value : e })); };

  // ── Azioni sensibili / byuppini / reset password ──
  const [resetSent, setResetSent] = useStateUtn(false);
  const [byupPopup, setByupPopup] = useStateUtn(null); // 'add' | 'sub' | null
  const [byupAmount, setByupAmount] = useStateUtn('');
  const [byupFeedback, setByupFeedback] = useStateUtn(null);
  const [deletePopup, setDeletePopup] = useStateUtn(false);
  const [banPopup, setBanPopup] = useStateUtn(null); // 'ban' | 'unban' | 'sospendi' | 'rimuovi-sospensione' | null
  // Il motivo del ban (P-156.7): nel modello è obbligatorio, e prima la riga
  // nasceva senza — la funzione veniva chiamata senza argomenti.
  const [banMotivo, setBanMotivo] = useStateUtn('');
  const [banned, setBanned] = useStateUtn(!!u.bannato);
  // Le azioni che la scheda promette di registrare LE REGISTRA (P-144): prima
  // cinque finestre dicevano «viene registrata nell'audit log» e nessuna ci
  // scriveva. Tipo dell'azione, chi, su chi, quando e il motivo dove c'è.
  const utnAudit = (action, target, icon, color, tipo) => {
    if (typeof AUDIT_EVENTS === 'undefined') return;
    const me = hubUtenteCorrente();
    AUDIT_EVENTS.unshift({ who: me.nomeCompleto || me.nome, action, target, icon, color, tipo, when: new Date() });
  };
  const [sospeso, setSospeso] = useStateUtn(!!u.sospensioneRecensioni);
  // Anche azioni e popup ripartono dal nuovo utente: il ✓ del reset password
  // di uno non deve firmare l'email di un altro.
  React.useEffect(() => {
    setBanned(!!u.bannato); setSospeso(!!u.sospensioneRecensioni); setBanPopup(null); setBanMotivo('');
    setResetSent(false); setByupPopup(null); setByupAmount(''); setByupFeedback(null); setDeletePopup(false);
  }, [u.id]);
  const confirmBan = () => {
    // Ogni applicazione e ogni revoca passa anche dal registro restrizioni:
    // è quello che alimenta l'elenco in Utenti app.
    if (banPopup === 'ban' && !banMotivo.trim()) return;
    if (banPopup === 'ban' || banPopup === 'unban') {
      u.bannato = banPopup === 'ban'; setBanned(u.bannato);
      if (u.bannato) {
        admAggiungiRestrizione(u, 'ban', { motivo: banMotivo.trim(), operatore: hubUtenteCorrente().id });
        utnAudit('ha bloccato l\'account di', `${form.nome} · ${u.id} · ${banMotivo.trim()}`, 'lock', 'DANGER', 'utenti');
      } else {
        admRevocaPerUtente(u.id, 'ban');
        utnAudit('ha rimosso il blocco a', `${form.nome} · ${u.id}`, 'check', 'OK', 'utenti');
      }
    }
    // La sospensione (P-88) si applica dal popup condiviso con la moderazione;
    // qui passa solo la revoca anticipata, firmata da chi è collegato.
    if (banPopup === 'rimuovi-sospensione') {
      u.sospensioneRecensioni = false; setSospeso(false);
      admRevocaPerUtente(u.id, 'review_suspension', hubUtenteCorrente().id);
    }
    setBanPopup(null); setBanMotivo('');
  };
  const confirmDelete = () => {
    // Il popup promette l'irreversibile, e a livello di mock l'azione agisce
    // sul modello come il ban: il flag resta sull'utente, e lo stadio
    // «Eliminato» in rubrica lo calcola hubStadio da questo flag — niente da
    // scrivere sulla riga, tornando in Contatti il contatto non si
    // ripresenta intatto come se niente fosse.
    u.eliminato = true;
    setDeletePopup(false); onClose();
  };

  // ── Recensioni dell'utente (mock deterministico) + rimozione con motivo ──
  const REV_TESTI = [
    'Esperienza ottima, servizio veloce e piatti curati. Torneremo di sicuro!',
    'Buono ma non eccezionale: attesa un po\' lunga, però la qualità c\'è.',
    'Location carina e personale gentile. Prezzi onesti per la zona.',
    'Deludente: ordine sbagliato e tavolo prenotato non pronto all\'arrivo.',
    'Il migliore della città per rapporto qualità/prezzo. Consigliato!',
    'Menu ricco e ben spiegato nell\'app, il QR al tavolo funziona benissimo.',
  ];
  // La BASE deterministica: la usa la tab Recensioni (che ci aggiunge lo
  // stato di rimozione) e la usa il Log, che deve raccontare le STESSE
  // recensioni — una fonte sola, niente doppioni che divergono.
  const recensioniBase = (() => {
    const attivi = LOCALI.filter(l => l.stato === 'active');
    const n = 2 + Math.floor(rnd(31) * 3); // 2-4 recensioni
    return Array.from({length: n}).map((_, i) => {
      const l = attivi[Math.floor(rnd(40 + i) * attivi.length)] || attivi[0];
      return {
        id: u.id + '-R' + i,
        locale: l,
        rating: 2 + Math.floor(rnd(50 + i) * 4),
        testo: REV_TESTI[Math.floor(rnd(60 + i) * REV_TESTI.length)],
        data: new Date(Date.now() - Math.floor(rnd(70 + i) * 200 + 3) * 86400000),
        rimossa: null,
      };
    });
  })();
  const [recensioni, setRecensioni] = useStateUtn(recensioniBase);
  const [revPopup, setRevPopup] = useStateUtn(null); // recensione da rimuovere
  const [revMotivo, setRevMotivo] = useStateUtn('');
  React.useEffect(() => { setRecensioni(recensioniBase.map(r => ({ ...r }))); setRevPopup(null); setRevMotivo(''); }, [u.id]);
  const confirmRimuoviRev = () => {
    if (!revMotivo.trim()) return;
    setRecensioni(prev => prev.map(r => r.id === revPopup.id ? { ...r, rimossa: revMotivo.trim() } : r));
    utnAudit('ha rimosso una recensione di', `${form.nome} · ${(revPopup.locale && revPopup.locale.nome) || 'locale'} · ${revMotivo.trim()}`, 'x', 'WARN', 'moderazione');
    setRevPopup(null); setRevMotivo('');
  };
  // ── Movimenti byuppini: l'audit che la card promette, in vista ──
  // La base è derivata dal seme (benvenuto + qualche movimento dall'app);
  // carichi e storni fatti da QUI si accodano in cima, con l'operatore.
  const movimentiBase = (() => {
    const out = [{ quando: u.dataRegistrazione, delta: 50, causale: 'Bonus di benvenuto', operatore: 'Sistema' }];
    const nm = 2 + Math.floor(rnd(430) * 3);
    for (let i = 0; i < nm; i++) {
      const r = rnd(431 + i * 2);
      const spesa = r < 0.35;
      out.push({
        quando: new Date(Date.now() - Math.floor(rnd(432 + i * 2) * 120 + 2) * 86400000),
        delta: spesa ? -(10 + Math.floor(r * 60)) : (5 + Math.floor(r * 40)),
        causale: spesa ? 'Premio riscattato in app' : 'Ordine pagato in app',
        operatore: 'App',
      });
    }
    return out.sort((a, b) => b.quando - a.quando);
  })();
  const [movimenti, setMovimenti] = useStateUtn(movimentiBase);
  React.useEffect(() => { setMovimenti(movimentiBase); }, [u.id]);

  const byupN = parseInt(byupAmount, 10) || 0;
  const byupValid = byupPopup === 'sub' ? (byupN > 0 && byupN <= u.byuppini) : byupN > 0;
  const confirmByup = () => {
    if (!byupValid) return;
    if (byupPopup === 'sub') {
      u.byuppini -= byupN;
      setByupFeedback(`−${byupN} byuppini stornati`);
    } else {
      u.byuppini += byupN;
      setByupFeedback(`+${byupN} byuppini caricati`);
    }
    const me = hubUtenteCorrente();
    setMovimenti(prev => [{
      quando: new Date(),
      delta: byupPopup === 'sub' ? -byupN : byupN,
      causale: byupPopup === 'sub' ? 'Storno manuale' : 'Accredito manuale',
      operatore: me.nomeCompleto || me.nome,
    }, ...prev]);
    utnAudit(byupPopup === 'sub' ? 'ha stornato byuppini a' : 'ha caricato byuppini a',
      `${byupN} byuppini · ${form.nome} · ${byupPopup === 'sub' ? 'storno manuale' : 'accredito manuale'}`,
      byupPopup === 'sub' ? 'x' : 'plus', byupPopup === 'sub' ? 'WARN' : 'OK', 'utenti');
    setByupPopup(null); setByupAmount('');
    setTimeout(()=>setByupFeedback(null), 2500);
  };

  // ── Statistiche (tab): le abitudini d'uso della piattaforma ──
  // Le derivate escono da utnStatDerivate — la STESSA formula che fa le
  // mediane della base utenti, così il confronto confronta la stessa cosa.
  const der = utnStatDerivate(u);
  const { tempoOrdine, tempoPagamento, tempoPrenotazione, spesaMedia, etaGiorniAccount, prenAnno } = der;
  const refLocali = Math.floor(rnd(305) * 9);          // inviti a ristoranti
  const refUtenti = Math.floor(rnd(306) * 15);         // inviti ad altri utenti
  const refTotali = refLocali + refUtenti;
  const refRiscattati = Math.round(refTotali * (0.2 + rnd(307) * 0.5));
  const refConversione = refTotali ? Math.round((refRiscattati / refTotali) * 100) : null;

  // ── Prenotazioni: il ritmo mensile e quante volte non s'è visto ──
  // La media mensile è un dodicesimo delle annue, con una cifra decimale
  // perché il ritmo si veda. Il no show si CONTA (rnd·rnd lo pesca basso:
  // quasi tutti onorano) e il tasso ne discende: su pochi appuntamenti la
  // percentuale mente — «3% di 1 prenotazione» non esiste — e lì la scheda
  // mostra il conteggio, non il tasso.
  const prenMese = Math.round((prenAnno / 12) * 10) / 10;
  const noShowN = prenAnno ? Math.min(prenAnno, Math.round(rnd(420) * rnd(421) * prenAnno * 0.3)) : 0;
  const noShowPct = prenAnno ? Math.round((noShowN / prenAnno) * 100) : null;

  // ── Consensi (tab): lo specchio di ByupConsensi dell'app ──
  // Le chiavi sono i nomi del modello (consent_events.consent_type, P-161 ·
  // D-115): dietary_preferences (era A3, il dato alimentare nel profilo),
  // offers_on_preferences (era A18: vale solo INSIEME a un canale marketing
  // acceso, mai da sola — il dato è sensibile) e i quattro del marketing di
  // P-163 (email, messaggi = sms e whatsapp con un gesto solo, notifiche,
  // profilazione). La sigla del registro dei trattamenti resta nell'etichetta.
  // Ogni consenso porta {ok, quando, versione}: la versione è il documento
  // contro cui è stato espresso. Qualcuno non è mai stato interpellato: quello
  // è un terzo stato, non un «no».
  const consensi = [
    { id: 'dietary_preferences',  label: 'Preferenze alimentari nel profilo · A3',
      desc: 'Salvataggio di dieta e allergie per filtrare i menu — dato sensibile' },
    { id: 'offers_on_preferences', label: 'Offerte su preferenze alimentari · A18',
      desc: 'Promozioni costruite sul dato alimentare — vale solo con un canale marketing acceso' },
    { id: 'marketing_email',        label: 'Marketing · Email · A6', desc: 'Novità e offerte via email' },
    { id: 'marketing_sms',          label: 'Marketing · Messaggi · A6', desc: 'SMS e WhatsApp (marketing_whatsapp viaggia con lo stesso gesto)' },
    { id: 'marketing_push',         label: 'Marketing · Notifiche · A6', desc: 'Le notifiche promozionali sul telefono' },
    { id: 'profilazione_marketing', label: 'Promo su misura sui tuoi ordini', desc: 'La profilazione a fini promozionali: una finalità, non un canale' },
  ].map((c, i) => {
    const deciso = rnd(400 + i * 3) > 0.15;
    const ok = deciso && rnd(401 + i * 3) > 0.35;
    const quando = new Date(Math.min(Date.now() - 86400000,
      u.dataRegistrazione.getTime() + Math.floor(rnd(402 + i * 3) * 200) * 86400000));
    return { ...c, deciso, ok, quando: deciso ? quando : null, versione: '1.0' };
  });
  const consensoA3 = consensi.find(c => c.id === 'dietary_preferences');
  // A18 non vale mai da sola — lo dichiara la sua stessa desc. Le estrazioni
  // sono indipendenti, il registro dell'app no: la domanda A18 nasce nello
  // stesso sheet di A3 (mai chiesta l'una senza l'altra), e quando A3 o A6
  // mancano ByupConsensi la spegne. Lo specchio mostra lo stato che l'app
  // può produrre, non l'estrazione grezza.
  const consensoA18 = consensi.find(c => c.id === 'offers_on_preferences');
  const canaleMarketing = consensi.some(c => ['marketing_email', 'marketing_sms', 'marketing_push'].includes(c.id) && c.ok);
  consensoA18.deciso = consensoA18.deciso && consensoA3.deciso;
  if (!consensoA18.deciso) consensoA18.quando = null;
  consensoA18.ok = consensoA18.deciso && consensoA18.ok && consensoA3.ok && canaleMarketing;

  // ── Gli interruttori dell'app (P-123): legittimo interesse e consenso ──
  // alimentare, in sola lettura, con lo stato e la data dell'ultimo evento.
  // `recommendations` e `analytics` corrono su legittimo interesse, con
  // l'interruttore di opposizione in «I miei dati» (P-26, D-31);
  // `dietary_suggestions` è il consenso esplicito distinto di D-03: le
  // esigenze alimentari entrano nei suggerimenti solo se la persona lo
  // accende dentro «Dieta & allergeni», spento in partenza — a interruttore
  // spento il motore non legge quei dati. I nomi sono quelli del modello
  // (consent_events.consent_type). L'app scrive il registro in localStorage
  // (ByupConsensi in app/byup-app-kit.jsx: stato corrente in
  // byup_consent_state, log append-only in byup_consent_data, righe
  // {id, ok, quando, versione}); sullo stesso dominio Hubble lo legge dal
  // vivo per l'utente demo dell'app (UTENTE_APP_DEMO_ID) e per gli altri
  // mostra valori d'esempio con i default dell'app. L'id storico LI-SUGG
  // (l'opposizione ai suggerimenti prima dei nomi del modello) vale come
  // recommendations. L'assistenza legge, non modifica: la frase «nessun
  // toggle, l'opposizione passa dall'assistenza» era falsa da P-26.
  const INTERRUTTORI_APP = [
    { id: 'recommendations',     alias: ['LI-SUGG'], label: 'Suggerimenti',                          desc: 'Legittimo interesse · «In base ai tuoi gusti» sui generi preferiti e sulla storia degli ordini, mai sui dati alimentari', difetto: true },
    { id: 'analytics',           alias: [],          label: 'Analisi d\'uso',                        desc: 'Legittimo interesse · i tre eventi del registro d\'uso (app_open, qr_scan, menu_view), città approssimata', difetto: true },
    { id: 'dietary_suggestions', alias: [],          label: 'Esigenze alimentari nei suggerimenti', desc: 'Consenso esplicito distinto (D-03) · dentro «Dieta & allergeni», spento in partenza', difetto: false },
  ];
  const leggiLS = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } };
  const interruttori = INTERRUTTORI_APP.map((t, i) => {
    if (u.id === window.UTENTE_APP_DEMO_ID) {
      const ids = [t.id, ...t.alias];
      const stato = leggiLS('byup_consent_state', {}) || {};
      const log = (leggiLS('byup_consent_data', []) || []).filter(r => r && ids.includes(r.id));
      const st = ids.map(id => stato[id]).find(Boolean) || null;
      const ultima = log.length ? log[log.length - 1] : null;
      // L'azione è quella scritta dall'app (P-161 · D-115): sulle due voci del
      // legittimo interesse 'opposed' e 'opposition_withdrawn', sul consenso
      // alimentare 'granted' e 'revoked'.
      if (st || ultima) return { ...t, ok: ultima ? !!ultima.ok : !!st.ok, quando: (ultima && ultima.quando) || (st && st.quando) || null, azione: (ultima && ultima.action) || (st && st.action) || null, vivo: true };
      // L'opposizione ai suggerimenti prima del registro: la chiave dell'app.
      if (t.id === 'recommendations' && leggiLS('byup_suggerimenti', 'on') === 'off') return { ...t, ok: false, quando: null, vivo: true };
      return { ...t, ok: t.difetto, quando: null, vivo: true };
    }
    const toccato = rnd(430 + i * 3) > 0.75;
    const quando = new Date(Math.min(Date.now() - 86400000, u.dataRegistrazione.getTime() + Math.floor(rnd(431 + i * 3) * 200) * 86400000));
    return { ...t, ok: toccato ? !t.difetto : t.difetto, quando: toccato ? quando : null, vivo: false };
  });

  // ── Preferenze alimentari (tab Statistiche): SOLO col consenso A3 ──
  // Senza consenso il dato non si mostra — non «non c'è»: non si guarda.
  const dietaOpz = ['Vegetariano', 'Vegano', 'Senza glutine', 'Halal', 'Kosher', 'Pescetariano'];
  const allergOpz = ['Glutine', 'Lattosio', 'Frutta a guscio', 'Uova', 'Crostacei', 'Pesce', 'Soia', 'Sedano'];
  const dieta = rnd(410) < 0.45 ? dietaOpz[Math.floor(rnd(411) * dietaOpz.length)] : null;
  const allergie = allergOpz.filter((_, i) => rnd(412 + i) < 0.18);

  // ── Log (tab): i tre eventi del registro d'uso, e nient'altro ──
  // Prima il log ricostruiva qui ordini, pagamenti, prenotazioni, recensioni,
  // byuppini, push e consensi «dai dati delle altre tab», per non
  // contraddirle: era la cura sbagliata alla diagnosi giusta. Un registro
  // parallelo che si tiene sincronizzato a mano è comunque una seconda
  // verità; quei fatti si leggono dove nascono, e il log rimanda lì.
  // I dettagli sono ciò che il modello porta: la sede per QR e menù, la città
  // per l'apertura. Niente durata (non c'è un evento di chiusura), niente
  // tavolo, niente conteggio dei piatti. Resta un CAMPIONE recente.
  const eventi = (() => {
    const attivi = LOCALI.filter(l => l.stato === 'active');
    const out = [];
    const push = (tipo, quando, dettaglio) => out.push({ id: u.id + '-E' + out.length, tipo, quando, dettaglio });
    const nSess = 8 + Math.floor(rnd(80) * 6);
    let ore = 1 + Math.floor(rnd(81) * 30);
    for (let i = 0; i < nSess; i++) {
      const r = rnd(90 + i * 4);
      const l = attivi[Math.floor(rnd(91 + i * 4) * attivi.length)] || attivi[0];
      const tipo = ['app_open', 'app_open', 'menu_view', 'qr_scan'][Math.floor(r * 3.999)];
      push(tipo, new Date(Date.now() - ore * 3600000),
        tipo === 'app_open' ? (u.citta || '—') : `${l.nome} · ${l.citta}`);
      ore += 4 + Math.floor(rnd(93 + i * 4) * 80);
    }
    return out.sort((a, b) => b.quando - a.quando);
  })();
  // Il filtro per data del log: due estremi, entrambi facoltativi. L'«al» è
  // compreso — chi scrive una data intende quel giorno, non la sua mezzanotte.
  const [logDal, setLogDal] = useStateUtn('');
  const [logAl, setLogAl] = useStateUtn('');
  React.useEffect(() => { setLogDal(''); setLogAl(''); }, [u.id]);
  const eventiFiltrati = eventi.filter(e =>
    (!logDal || e.quando >= new Date(logDal)) &&
    (!logAl || e.quando < new Date(new Date(logAl).getTime() + 86400000)));

  const inputStyle = {
    width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8,
    fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};

  // La mediana accanto al numero: un metro, non un giudizio — la freccia
  // dice solo da che parte stai rispetto alla base utenti.
  const vsMediana = (v, m, fmt) => (m == null || v == null) ? null : (
    <React.Fragment>
      {' · '}
      <span style={{fontWeight:700, color: v >= m ? ADM.OK : ADM.MUTED_SOFT}}>{v >= m ? '↑' : '↓'}</span>
      {' mediana ' + fmt(m)}
    </React.Fragment>
  );

  return (
    <div onClick={pieno ? undefined : onClose} style={pieno ? {} : {
      position:'fixed', inset:0, zIndex:50,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
    }}>
      <div onClick={e=>e.stopPropagation()} style={pieno ? {
        width:'100%', background:'#fff',
        display:'flex', flexDirection:'column', position:'relative',
      } : {
        width:760, maxWidth:'94%', background:'#fff', maxHeight:'88%',
        borderRadius:18, overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.22s cubic-bezier(0.22,0.9,0.35,1)',
        position:'relative',
      }}>
        {/* Header — titolo popup + identità essenziale (la meta vive in Anagrafica) */}
        <div style={{padding:'16px 24px 0', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Dettaglio utente</span>
            {!pieno && <AdmIconBtn icon="x" onClick={onClose}/>}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
            <AdmAvatar name={form.nome} size={46} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
            {/* SOLO il nome: stato e verifica sono anagrafe e vivono nella
                tab Anagrafica — la testata presenta, non riassume. */}
            <div style={{
              flex:1, minWidth:0,
              fontSize:19, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{form.nome}</div>
          </div>
          {/* Tabs */}
          <div style={{display:'flex', gap:2}}>
            {[{id:'anagrafica', label:'Anagrafica'},{id:'account', label:'Account'},{id:'statistiche', label:'Statistiche'},{id:'consensi', label:'Consensi'},{id:'log', label:`Log (${eventi.length})`},{id:'recensioni', label:`Recensioni (${recensioni.length})`}].map(t => (
              <button key={t.id} className="adm-pill" onClick={()=>setTab(t.id)} style={{
                padding:'9px 14px', background:'transparent', border:'none',
                borderBottom:`2px solid ${tab === t.id ? ADM.PINK : 'transparent'}`,
                color: tab === t.id ? ADM.TEXT : ADM.MUTED,
                fontSize:13.5, fontWeight: tab === t.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit', marginBottom:-1,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ═══ TAB ANAGRAFICA ═══ */}
        {tab === 'anagrafica' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
                <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Informazioni account</div>
                {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
              </div>
              {/* La verifica sta IN CIMA: è la prima cosa che si guarda su
                  un account, prima ancora di com'è compilato. */}
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5, fontWeight:600, color:ADM.TEXT}}>Account verificato</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:1}}>Identità confermata via documento o pagamento</div>
                </div>
                <AdmSwitch checked={form.verificato} onChange={(v)=>{ setSaved(false); setForm(prev=>({...prev, verificato:v})); }}/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
                <div style={{gridColumn:'1 / -1'}}>
                  <label style={labelStyle}>Nome e cognome</label>
                  <input value={form.nome} onChange={F('nome')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={form.email} onChange={F('email')} style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input value={form.tel} onChange={F('tel')} style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                <div>
                  <label style={labelStyle}>Luogo principale</label>
                  <input value={form.citta} onChange={F('citta')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Regione</label>
                  <input value={form.regione} onChange={F('regione')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Data di nascita</label>
                  <input type="date" value={form.dataNascita} onChange={F('dataNascita')} style={inputStyle}/>
                  {etaCalcolata !== null && <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:4}}>{etaCalcolata} anni</div>}
                </div>
                <div>
                  <label style={labelStyle}>Genere</label>
                  <AdmSelect value={form.sesso} onChange={F('sesso')} block
                    buttonStyle={{padding:'8px 11px', borderRadius:8, fontSize:13.5}}
                    options={[
                      {value:'F', label:'Donna'},
                      {value:'M', label:'Uomo'},
                      {value:'X', label:'Altro / N.D.'},
                    ]}/>
                </div>
                <div>
                  <label style={labelStyle}>Codice utente</label>
                  <div style={{...inputStyle, background:ADM.PANEL_SOFT, color:ADM.MUTED, fontFamily:'ui-monospace,monospace', fontSize:12.5, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    {u.id}
                    <span style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:ADM.MUTED_SOFT}}>non modificabile</span>
                  </div>
                </div>
                <div>
                  {/* Lo stato che prima stava appiccicato al nome in testata:
                      è anagrafe, si legge qui — restrizioni comprese. */}
                  <label style={labelStyle}>Stato</label>
                  <div style={{display:'flex', alignItems:'center', minHeight:34}}>
                    {u.eliminato
                      ? <AdmBadge color="PLAN_FREE" size="xs">Eliminato</AdmBadge>
                      : banned
                      ? <AdmBadge color="DANGER" size="xs">Bannato</AdmBadge>
                      : sospeso
                      ? <AdmBadge color="WARN" size="xs">Sospeso dalle recensioni</AdmBadge>
                      : u.attivo
                      ? <AdmBadge color="OK" size="xs">Attivo</AdmBadge>
                      : <AdmBadge color="PLAN_FREE" size="xs">Inattivo</AdmBadge>}
                  </div>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:14}}>
                <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={saveForm}>Salva modifiche</AdmButton>
              </div>
            </AdmCard>

          </div>
        )}

        {/* ═══ TAB ACCOUNT — la gestione dell'utenza ═══ */}
        {/* Le AZIONI sull'account — saldo fedeltà, credenziali, restrizioni —
            stavano in coda all'anagrafica, ma l'anagrafica dice chi è la
            persona: qui c'è quello che si può FARE al suo account, con la
            zona sensibile per ultima, sobria com'era. */}
        {tab === 'account' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* Byuppini: il saldo è il PROTAGONISTA della card — cifra
                grande con la sua unità accanto — e le azioni stanno sul
                loro lato, non appiccicate al numero. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Byuppini</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:2}}>Il saldo del programma fedeltà. Carichi e storni sono manuali e finiscono nell'audit log.</div>
              </div>
              <div style={{padding:'16px 20px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
                <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                  <span style={{fontSize:32, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1, fontVariantNumeric:'tabular-nums'}}>{fmtNum(u.byuppini)}</span>
                  <span style={{fontSize:12, fontWeight:800, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em'}}>byuppini</span>
                </div>
                {byupFeedback && (
                  <span style={{
                    padding:'4px 11px', borderRadius:999, fontSize:12.5, fontWeight:700,
                    background: byupFeedback.startsWith('−') ? ADM.DANGER_SOFT : ADM.OK_SOFT,
                    color: byupFeedback.startsWith('−') ? ADM.DANGER : ADM.OK,
                  }}>✓ {byupFeedback}</span>
                )}
                <div style={{flex:1}}/>
                <AdmButton variant="secondary" size="md" icon="plus" onClick={()=>setByupPopup('add')}>Carica…</AdmButton>
                <AdmButton variant="ghost" size="md" onClick={()=>setByupPopup('sub')}>Storna…</AdmButton>
              </div>
              {/* L'audit che la testata promette, IN VISTA: gli ultimi
                  movimenti, con chi li ha fatti. Un carico fatto da qui
                  compare in cima appena confermato. */}
              <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{padding:'10px 20px 4px', fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em'}}>Ultimi movimenti</div>
                {movimenti.slice(0, 6).map((m, i, arr) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'8px 20px',
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                  }}>
                    <span style={{fontSize:12.6, color:ADM.MUTED, width:88, flexShrink:0}}>{fmtDate(m.quando)}</span>
                    <span style={{flex:1, minWidth:0, fontSize:13.3, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {m.causale} <span style={{color:ADM.MUTED_SOFT}}>· {m.operatore}</span>
                    </span>
                    <span style={{fontVariantNumeric:'tabular-nums', fontSize:13.3, fontWeight:800, color: m.delta < 0 ? ADM.DANGER : ADM.OK, flexShrink:0}}>
                      {m.delta < 0 ? '−' : '+'}{fmtNum(Math.abs(m.delta))}
                    </span>
                  </div>
                ))}
              </div>
            </AdmCard>

            {/* Sicurezza */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Reset password</div>
                  {/* L'email SALVATA (u.email), non quella del form: una
                      modifica non ancora salvata in Anagrafica non deve
                      diventare l'indirizzo a cui parte un reset. */}
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>
                    {resetSent ? <span style={{color:ADM.OK, fontWeight:700}}>✓ Email di reset inviata a {u.email}</span> : `Invia un link di reimpostazione a ${u.email}`}
                  </div>
                </div>
                <AdmButton variant="secondary" size="md" icon="mail" disabled={resetSent} onClick={()=>setResetSent(true)}>Invia email di reset</AdmButton>
              </div>
            </AdmCard>

            {/* Zona sensibile — volutamente sobria e in fondo. La sospensione
                delle recensioni non sta qui: agisce sulle recensioni, e il suo
                comando vive nella loro tab, accanto a ciò che ferma. */}
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 6px 10px'}}>
              <span style={{fontSize:12, color:ADM.MUTED_SOFT, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Zona sensibile</span>
              <div style={{flex:1, height:1, background:ADM.BORDER_SOFT}}/>
              {/* P-41 (D-33): il ban chiede Scrittura su Moderazione. */}
              <button className="adm-textlink" disabled={!hubPuo('moderazione', 'scrittura')} title={hubPuo('moderazione', 'scrittura') ? undefined : 'Serve Scrittura su Moderazione'} onClick={()=>setBanPopup(banned ? 'unban' : 'ban')} style={{
                background:'transparent', border:'none', color: banned ? ADM.MUTED : ADM.DANGER, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>{banned ? 'Rimuovi ban…' : 'Banna utente…'}</button>
              <button className="adm-textlink" onClick={()=>setDeletePopup(true)} style={{
                background:'transparent', border:'none', color:ADM.DANGER, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>Elimina account…</button>
            </div>
          </div>
        )}

        {/* ═══ TAB STATISTICHE — le abitudini d'uso della piattaforma ═══ */}
        {tab === 'statistiche' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* Niente «tempo medio di utilizzo» né sessioni (P-147): il
                registro degli eventi d'uso non ha una chiusura, e quel numero
                veniva dal seme. Se servirà una misura d'uso, è il ritorno —
                chi apre l'app in un mese e la riapre nel successivo — che si
                calcola con gli eventi che già ci sono. */}
            {/* La spesa: la media al centesimo, col totale accanto che le fa
                da ancora — una media da sola non dice se pesa. I numeri sono
                quelli veri del dataset (spesa totale / ordini totali). */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Spesa</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto vale, in media, un suo ordine.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
                <MiniStat first label="Spesa media" value={utnEur2(spesaMedia)}
                  sub={<React.Fragment>Per ordine pagato in app{vsMediana(spesaMedia, UTN_MEDIANE.spesaMedia, utnEur2)}</React.Fragment>}/>
                <MiniStat label="Spesa totale" value={fmtEur(u.spesaTotale)} sub={`${fmtNum(u.ordini)} ordini dall'iscrizione`}/>
              </div>
            </AdmCard>

            {/* Le prenotazioni: quante in un anno, con che ritmo, e quante
                volte ha prenotato senza presentarsi. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Prenotazioni</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto prenota, e quanto ci si può contare.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
                <MiniStat first label="Prenotazioni annue" value={fmtNum(prenAnno)}
                  sub={<React.Fragment>Ultimi 12 mesi{vsMediana(prenAnno, UTN_MEDIANE.prenAnno, fmtNum)}</React.Fragment>}/>
                <MiniStat label="Media mensile" value={String(prenMese).replace('.', ',')} sub="Prenotazioni al mese"/>
                {/* Sotto le dieci prenotazioni la percentuale mente («3% di
                    1» non esiste): si mostra il conteggio, non il tasso. */}
                {prenAnno >= 10
                  ? <MiniStat label="Tasso di no show" value={noShowPct + '%'} sub={`${fmtNum(noShowN)} non onorate su ${fmtNum(prenAnno)}`}/>
                  : <MiniStat label="No show" value={prenAnno ? `${fmtNum(noShowN)} su ${fmtNum(prenAnno)}` : '—'}
                      sub={prenAnno ? 'Troppo poche per un tasso' : 'Nessuna prenotazione'}/>}
              </div>
            </AdmCard>

            {/* I tempi dentro i tre flussi principali: quanto ci mette a
                mandare un ordine, a pagarlo, a prendere una prenotazione. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Tempi medi</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto ci mette, in media, dentro i tre flussi principali.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
                <MiniStat first label="Ordine inviato" value={utnDurata(tempoOrdine)} sub="Dal menu aperto all'invio"/>
                <MiniStat label="Pagamento dopo l'ordine" value={utnDurata(tempoPagamento)} sub="Dall'ordine al conto pagato"/>
                <MiniStat label="Prenotazione presa" value={utnDurata(tempoPrenotazione)} sub="Dentro una sessione"/>
              </div>
            </AdmCard>

            {/* Gli inviti che l'utente MANDA: si chiamano così, non
                «Referral», perché nelle proprietà CRM della rubrica
                «Referral» è chi ha portato il contatto — stessa parola,
                verso opposto, e una parola sola per due sensi confonde. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Inviti</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Gli inviti che ha mandato e quanti sono stati riscattati.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
                <MiniStat first label="Inviati a ristoranti" value={fmtNum(refLocali)} sub="Locali invitati su byup"/>
                <MiniStat label="Inviati a utenti" value={fmtNum(refUtenti)} sub="Amici invitati in app"/>
                <MiniStat label="Riscattati" value={fmtNum(refRiscattati)} sub={`Su ${fmtNum(refTotali)} inviati`}/>
                <MiniStat label="Conversione" value={refConversione == null ? '—' : refConversione + '%'} sub="Riscattati su inviati"/>
              </div>
            </AdmCard>

            {/* Il dato alimentare si guarda SOLO col consenso A3: senza,
                la card non dice «niente allergie» — dice che non si guarda.
                È la differenza tra un dato assente e un dato non nostro. */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Preferenze alimentari</div>
                <span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, fontWeight:700, padding:'2px 7px', borderRadius:5, background: consensoA3.ok ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: consensoA3.ok ? ADM.OK : ADM.MUTED}}>A3 {consensoA3.ok ? '✓' : '—'}</span>
              </div>
              {consensoA3.ok ? (
                <React.Fragment>
                  <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, marginBottom:14}}>Quello che ha attivato nel profilo, col consenso al trattamento del dato.</div>
                  <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
                    <span style={{width:70, flexShrink:0, fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Dieta</span>
                    {dieta
                      ? <span style={{padding:'3px 10px', borderRadius:999, background:ADM.OK_SOFT, color:ADM.OK, fontSize:13, fontWeight:700}}>{dieta}</span>
                      : <span style={{fontSize:13.5, color:ADM.MUTED_LIGHT}}>Nessuna dieta attiva</span>}
                  </div>
                  <div style={{display:'flex', alignItems:'baseline', gap:10}}>
                    <span style={{width:70, flexShrink:0, fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Allergie</span>
                    {allergie.length
                      ? <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                          {allergie.map(a => <span key={a} style={{padding:'3px 10px', borderRadius:999, background:ADM.WARN_SOFT, color:'#92400E', fontSize:13, fontWeight:700}}>{a}</span>)}
                        </div>
                      : <span style={{fontSize:13.5, color:ADM.MUTED_LIGHT}}>Nessuna allergia attiva</span>}
                  </div>
                </React.Fragment>
              ) : (
                <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:8, lineHeight:1.5}}>
                  Non ha espresso il consenso al salvataggio delle preferenze alimentari (A3):
                  il dato non si raccoglie e non si mostra. Lo stato del consenso è nella tab Consensi.
                </div>
              )}
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB CONSENSI — a cosa ha detto sì, e su quale documento ═══ */}
        {tab === 'consensi' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* Lo stato corrente per codice. La PROVA non è questa: è il log
                append-only consent_data, riga per riga nella tab Log. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Consensi espressi</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Lo stato corrente per ciascun codice. La prova è il log consent_data: ogni cambio è una riga nella tab Log.</div>
              </div>
              {consensi.map((c, i) => (
                <div key={c.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                  <span style={{fontFamily:'ui-monospace,monospace', fontSize:10.5, fontWeight:700, color:ADM.MUTED, width:150, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={c.id}>{c.id}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{c.label}</div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{c.desc}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    {c.deciso
                      ? <span style={{padding:'3px 10px', borderRadius:5, background: c.ok ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: c.ok ? ADM.OK : ADM.MUTED, fontSize:13, fontWeight:700}}>{c.ok ? 'Sì' : 'No'}</span>
                      : <span style={{padding:'3px 10px', borderRadius:5, background:ADM.NEUTRAL_SOFT, color:ADM.MUTED_SOFT, fontSize:13, fontWeight:700}}>Mai chiesto</span>}
                    {c.deciso && <div style={{fontSize:12, color:ADM.MUTED, marginTop:3}}>{fmtDate(c.quando)} · Informativa v{c.versione}</div>}
                  </div>
                </div>
              ))}
              {/* I tre interruttori dell'app (P-123), in sola lettura. Non
                  sono i consensi qui sopra: due corrono su legittimo interesse
                  con l'opposizione, uno è il consenso distinto sul dato
                  alimentare. Li muove la persona dall'app; ogni cambio è una
                  riga del log consent_data. */}
              <div style={{padding:'12px 20px 8px', borderTop:`1px solid ${ADM.BORDER}`, background:ADM.PANEL_SOFT}}>
                <div style={{fontSize:13.6, fontWeight:700, color:ADM.TEXT}}>Interruttori dell'app</div>
                <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2, lineHeight:1.5}}>
                  Suggerimenti e analisi d'uso corrono su legittimo interesse, con l'interruttore di opposizione in «I miei dati»; le esigenze alimentari nei suggerimenti sono un consenso distinto, che la persona accende dentro «Dieta &amp; allergeni». Sola lettura: li muove la persona dall'app, e ogni cambio è una riga del log consent_data.
                  {interruttori[0].vivo ? ' Qui: lo stato che l\'app ha scritto su questo dominio.' : ' Qui: valori d\'esempio del mock.'}
                </div>
              </div>
              {interruttori.map((t, i) => (
                <div key={t.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i === interruttori.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                  <AdmSwitch checked={t.ok} disabled size="sm"/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{t.label} <span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT, fontWeight:600, marginLeft:4}}>{t.id}</span></div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{t.desc}{t.azione ? <span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT}}> · ultima azione: {t.azione}</span> : null}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <span style={{padding:'3px 10px', borderRadius:5, background: t.ok ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: t.ok ? ADM.OK : ADM.MUTED, fontSize:13, fontWeight:700}}>{t.ok ? 'Acceso' : 'Spento'}</span>
                    <div style={{fontSize:12, color:ADM.MUTED, marginTop:3}}>{t.quando ? `Ultimo evento ${fmtDate(t.quando)}` : 'Nessun evento · vale il valore di partenza'}</div>
                  </div>
                </div>
              ))}
            </AdmCard>

            {/* I documenti: le versioni contro cui i consensi valgono. I
                Termini non sono un consenso — sono il contratto — ma è qui
                che si viene a cercare che cosa ha firmato. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Documenti sottoscritti</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Le versioni contro cui valgono i consensi qui sopra.</div>
              </div>
              {[
                { nome: 'Informativa privacy', versione: '1.0', nota: 'Presa visione alla registrazione · è la versione scritta accanto a ogni consenso', rif: consensi.filter(c => c.deciso).map(c => c.id).join(', ') || '—' },
                { nome: 'Termini e condizioni', versione: '1.0', nota: 'Accettati alla registrazione · base contrattuale, non un consenso', rif: 'Contratto' },
              ].map((d, i, arr) => (
                <div key={d.nome} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                  <div style={{width:34, height:34, borderRadius:8, background:ADM.PINK_SOFT, color:ADM.PINK, display:'grid', placeItems:'center', flexShrink:0}}>
                    <BuIcons.filePdf size={18}/>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{d.nome} <span style={{fontFamily:'ui-monospace,monospace', fontSize:12, color:ADM.MUTED, fontWeight:600}}>v{d.versione}</span></div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{d.nota}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontSize:12.6, color:ADM.MUTED}}>{fmtDate(u.dataRegistrazione)}</div>
                    <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:2}}>{d.rif}</div>
                  </div>
                </div>
              ))}
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB LOG — gli eventi che l'app emette ═══ */}
        {tab === 'log' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* L'inquadratura del tracciato: da quando esiste l'account e
                quando si è visto l'ultima volta. Stava nella tab delle spese;
                è attività, e l'attività ora vive qui. */}
            <AdmCard padding={20}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Attività account</div>
              <DataRow label="Registrato il" value={fmtDate(u.dataRegistrazione)}/>
              <DataRow label="Ultima sessione" value={fmtRelative(u.lastSession)} last/>
            </AdmCard>

            {/* Il log così come arriva dal tracking: un evento per riga, la
                chiave tecnica in chiaro accanto al racconto — è la stessa
                che si ritrova negli export e in Analisi Dati. Nessun
                riassunto: la risposta a «che cosa ha fatto in app?» sono gli
                eventi stessi, dal più recente. Niente icone: è un log, e un
                log si scandisce per testo e data, non per figurine. */}
            <AdmCard padding={0}>
              <div style={{padding:'14px 20px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Eventi tracciati</div>
                <div style={{fontSize:13, color:ADM.MUTED}}>
                  {(logDal || logAl) ? `${eventiFiltrati.length} di ${eventi.length}` : `${eventi.length} eventi dal ${fmtDate(eventi[eventi.length - 1].quando)}`}
                </div>
                <div style={{flex:1}}/>
                {/* Il filtro per data: due estremi, entrambi facoltativi. */}
                <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Dal</span>
                <input type="date" value={logDal} onChange={e=>setLogDal(e.target.value)} style={{
                  padding:'6px 9px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:12.8, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
                }}/>
                <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Al</span>
                <input type="date" value={logAl} onChange={e=>setLogAl(e.target.value)} style={{
                  padding:'6px 9px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:12.8, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
                }}/>
                {(logDal || logAl) && (
                  <button className="adm-textlink" onClick={()=>{ setLogDal(''); setLogAl(''); }} style={{
                    background:'transparent', border:'none', color:ADM.PINK_DARK, fontSize:12.5, fontWeight:700,
                    cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
                  }}>Azzera</button>
                )}
              </div>
              {/* La riga in testa dice che cos'è questo registro e a quali
                  condizioni si scrive: chi lo legge deve sapere perché ci
                  trova tre cose e non undici. */}
              <div style={{padding:'10px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, fontSize:12.6, color:ADM.MUTED, lineHeight:1.5, background:ADM.PANEL_SOFT}}>
                Il registro d'uso dell'app: tre eventi, <span style={{fontFamily:'ui-monospace,monospace'}}>app_open</span>, <span style={{fontFamily:'ui-monospace,monospace'}}>qr_scan</span> e <span style={{fontFamily:'ui-monospace,monospace'}}>menu_view</span>. Si scrive solo con i suggerimenti accesi, senza indirizzo di rete, coordinate né impronte del dispositivo; la città è l'unico contesto di luogo.
              </div>
              {eventiFiltrati.length === 0 && (
                <div style={{padding:'26px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>
                  Nessun evento tra le date scelte.
                </div>
              )}
              {eventiFiltrati.map((e, i) => (
                <div key={e.id} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 20px',
                  borderBottom: i === eventiFiltrati.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                  background: i % 2 === 1 ? ADM.ROW_STRIPE : 'transparent',
                }}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{UTN_EVENTI[e.tipo].label}</div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.dettaglio}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT}}>{e.tipo}</div>
                    <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2}}>{fmtDateTime(e.quando)}</div>
                  </div>
                </div>
              ))}
            </AdmCard>

            {/* Gli otto tipi che stavano qui erano proiezioni: ordini,
                pagamenti, prenotazioni, recensioni, byuppini, notifiche e
                consensi. Non si riscrivono in un registro parallelo — si
                leggono dove nascono, e questa card ci porta. Senza, chi apre
                Log e ci trova tre cose invece di undici legge un buco. */}
            <AdmCard padding={20}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Gli altri fatti vivono nelle loro tabelle</div>
              <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>Una seconda scrittura dello stesso fatto è una seconda verità destinata a divergere: qui non si copiano, si raggiungono.</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:12}}>
                {[
                  { label: 'Ordini e pagamenti', dove: 'Statistiche', vai: () => setTab('statistiche') },
                  { label: 'Prenotazioni',       dove: 'Statistiche', vai: () => setTab('statistiche') },
                  { label: 'Recensioni',         dove: 'Recensioni',  vai: () => setTab('recensioni') },
                  { label: 'Byuppini',           dove: 'Account',     vai: () => setTab('account') },
                  { label: 'Consensi',           dove: 'Consensi',    vai: () => setTab('consensi') },
                  { label: 'Notifiche',          dove: 'Diario del contatto', vai: onDiario || null },
                ].map(r => (
                  <button key={r.label} className="adm-pill" disabled={!r.vai} onClick={() => r.vai && r.vai()} style={{
                    display:'inline-flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:9,
                    background:'#fff', border:`1px solid ${ADM.BORDER}`, cursor: r.vai ? 'pointer' : 'default',
                    fontFamily:'inherit', fontSize:12.8, color:ADM.TEXT, opacity: r.vai ? 1 : 0.6,
                  }}>
                    <span style={{fontWeight:700}}>{r.label}</span>
                    <span style={{color:ADM.MUTED}}>→ {r.dove}</span>
                    {r.vai && <BuIcons.chevronRight size={13} color={ADM.MUTED_LIGHT}/>}
                  </button>
                ))}
              </div>
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB RECENSIONI ═══ */}
        {tab === 'recensioni' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12, background:ADM.PANEL_SOFT}}>
            {/* La sospensione delle recensioni (P-88) vive QUI, accanto a ciò
                che ferma: da attiva è un banner con fino a quando, il motivo,
                cosa è stato deciso sulle esistenti e il comando per revocarla;
                da spenta una riga di moderazione sobria — stesso registro della
                zona sensibile, perché resta un'azione da pesare. */}
            {sospeso ? (() => { const sr = admRestrizioneAttiva(u.id, 'review_suspension'); return (
              <div style={{padding:'12px 14px', background:'#FFF7E6', border:'1px solid #FDE68A', borderRadius:10, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                <BuIcons.shield size={18} color="#B45309"/>
                <div style={{flex:1, minWidth:200, fontSize:13, color:'#78350F', lineHeight:1.45}}>
                  <strong>Sospensione recensioni{sr ? ` fino al ${fmtDate(sr.fine)}` : ''}</strong> — non può pubblicare recensioni.
                  {sr ? <> Motivo: {sr.motivo}. Le esistenti {sr.esistenti === 'rimosse' ? 'sono state rimosse' : 'restano visibili'}; comunicato alla persona il {fmtDate(sr.comunicazione ? sr.comunicazione.quando : sr.data)}.</> : null}
                </div>
                <AdmButton variant="secondary" size="sm" disabled={!hubPuo('moderazione', 'scrittura')} title={hubPuo('moderazione', 'scrittura') ? undefined : 'Serve Scrittura su Moderazione'} onClick={()=>setBanPopup('rimuovi-sospensione')}>Rimuovi sospensione…</AdmButton>
              </div>
            ); })() : (
              <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 6px'}}>
                <span style={{fontSize:12, color:ADM.MUTED_SOFT, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Moderazione</span>
                <div style={{flex:1, height:1, background:ADM.BORDER_SOFT}}/>
                {/* P-41 (D-33): sospensione e ban chiedono Scrittura su Moderazione. */}
                <button className="adm-textlink" disabled={!hubPuo('moderazione', 'scrittura')} title={hubPuo('moderazione', 'scrittura') ? undefined : 'Serve Scrittura su Moderazione'} onClick={()=>setBanPopup('sospendi')} style={{
                  background:'transparent', border:'none', color: hubPuo('moderazione', 'scrittura') ? ADM.WARN : ADM.MUTED_LIGHT, fontSize:12.5, fontWeight:600,
                  cursor: hubPuo('moderazione', 'scrittura') ? 'pointer' : 'not-allowed', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
                }}>Sospendi recensioni…</button>
              </div>
            )}
            {recensioni.map(r => (
              <AdmCard key={r.id} padding={16}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:9, flexWrap:'wrap'}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{r.locale.nome}</div>
                    <div style={{fontSize:12.3, color:ADM.MUTED}}>{r.locale.citta} · {fmtDate(r.data)}</div>
                  </div>
                  <div style={{flex:1}}/>
                  <span style={{fontSize:14.4, letterSpacing:1, color:'#F5A623'}}>{'★'.repeat(r.rating)}<span style={{color:ADM.BORDER}}>{'★'.repeat(5 - r.rating)}</span></span>
                  {!r.rimossa && (
                    <button className="adm-textlink" onClick={()=>{ setRevPopup(r); setRevMotivo(''); }} style={{
                      background:'transparent', border:'none', color:ADM.DANGER, fontSize:12.5, fontWeight:600,
                      cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
                    }}>Rimuovi…</button>
                  )}
                </div>
                {r.rimossa ? (
                  <div style={{padding:'10px 13px', background:ADM.DANGER_SOFT, borderRadius:8, fontSize:13, color:'#7F1D1D', display:'flex', alignItems:'center', gap:8}}>
                    <BuIcons.x size={16}/>
                    <span><strong>Recensione rimossa</strong> · “{r.rimossa}” · registrata nell'audit log</span>
                  </div>
                ) : (
                  <div style={{padding:'10px 13px', background:ADM.PANEL_SOFT, borderLeft:`3px solid ${ADM.INK_SOFT}`, borderRadius:'0 8px 8px 0', fontSize:13.5, color:ADM.TEXT, lineHeight:1.5, fontStyle:'italic'}}>
                    “{r.testo}”
                  </div>
                )}
              </AdmCard>
            ))}
            {recensioni.length === 0 && (
              <div style={{padding:'30px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>Nessuna recensione pubblicata da questo utente.</div>
            )}
          </div>
        )}

        {/* ═══ Popup conferma: rimozione recensione ═══ */}
        {revPopup && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setRevPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:430, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere la recensione su {revPopup.locale.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>La recensione sparisce dalla scheda del locale. {form.nome} riceve una notifica con il motivo. L'azione viene registrata nell'audit log.</div>
              <textarea autoFocus value={revMotivo} onChange={e=>setRevMotivo(e.target.value)} placeholder="Motivo della rimozione (obbligatorio) — es. viola le linee guida della community"
                style={{width:'100%', minHeight:74, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.3, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:12}}/>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setRevPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" disabled={!revMotivo.trim()} onClick={confirmRimuoviRev}>Rimuovi recensione</AdmButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Popup: carica / storna byuppini ═══
            Il movimento si LEGGE prima di confermarlo: cifra grande con
            l'unità dentro il campo, le quantità ricorrenti a portata di
            click, e il riepilogo saldo → movimento → nuovo saldo. Chi
            conferma sa esattamente dove atterra il numero. */}
        {byupPopup && (() => {
          const sub = byupPopup === 'sub';
          const nuovo = sub ? u.byuppini - byupN : u.byuppini + byupN;
          return (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>{ setByupPopup(null); setByupAmount(''); }}>
            <div onClick={e=>e.stopPropagation()} style={{width:420, maxWidth:'92%', background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{padding:'18px 22px 13px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT}}>{sub ? 'Storna byuppini' : 'Carica byuppini'}</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:2}}>Sul saldo di {form.nome} · movimento manuale, registrato nell'audit log</div>
              </div>
              <div style={{padding:'16px 22px 18px'}}>
                <div style={{position:'relative', marginBottom:8}}>
                  <input type="number" min="1" max={sub ? u.byuppini : undefined} autoFocus value={byupAmount}
                    onChange={e=>setByupAmount(e.target.value)}
                    onKeyDown={e=>{ if (e.key === 'Enter') confirmByup(); }}
                    placeholder="0"
                    style={{...inputStyle, padding:'12px 104px 12px 14px', fontSize:20, fontWeight:800, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}/>
                  <span style={{position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:11.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', color:ADM.MUTED_SOFT, pointerEvents:'none'}}>byuppini</span>
                </div>
                {/* Le quantità ricorrenti: un click invece di tre tasti. */}
                <div style={{display:'flex', gap:6, marginBottom:14}}>
                  {[25, 50, 100, 250].map(q => {
                    const fuori = sub && q > u.byuppini;
                    const attivo = byupN === q;
                    return (
                      <button key={q} type="button" disabled={fuori} onClick={()=>setByupAmount(String(q))} style={{
                        padding:'5px 12px', borderRadius:999,
                        border:`1px solid ${attivo ? ADM.PINK : ADM.BORDER}`,
                        background: attivo ? ADM.PINK_BG_SOFT : '#fff',
                        color: fuori ? ADM.MUTED_LIGHT : attivo ? ADM.PINK_DARK : ADM.TEXT,
                        fontSize:12.8, fontWeight:700, fontFamily:'inherit',
                        cursor: fuori ? 'default' : 'pointer',
                      }}>{sub ? '−' : '+'}{q}</button>
                    );
                  })}
                </div>
                {/* Il riepilogo: da dove parte, cosa succede, dove arriva. */}
                <div style={{background:ADM.PANEL_SOFT, borderRadius:10, padding:'11px 14px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:13.3, color:ADM.MUTED}}>
                    <span>Saldo attuale</span>
                    <span style={{fontVariantNumeric:'tabular-nums', fontWeight:600, color:ADM.TEXT}}>{fmtNum(u.byuppini)}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:13.3, color:ADM.MUTED}}>
                    <span>{sub ? 'Storno' : 'Accredito'}</span>
                    <span style={{fontVariantNumeric:'tabular-nums', fontWeight:700, color: byupN > 0 ? (sub ? ADM.DANGER : ADM.OK) : ADM.MUTED_LIGHT}}>
                      {byupN > 0 ? (sub ? '−' : '+') + fmtNum(byupN) : '—'}
                    </span>
                  </div>
                  <div style={{height:1, background:ADM.BORDER_SOFT, margin:'6px 0'}}/>
                  <div style={{display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:13.5, fontWeight:700, color:ADM.TEXT}}>
                    <span>Nuovo saldo</span>
                    <span style={{fontVariantNumeric:'tabular-nums', fontWeight:800}}>{byupValid ? fmtNum(nuovo) : '—'}</span>
                  </div>
                </div>
                {sub && byupN > u.byuppini && (
                  <div style={{fontSize:12.5, color:ADM.DANGER, fontWeight:600, marginTop:10}}>Massimo stornabile: {fmtNum(u.byuppini)} — il saldo non può andare sotto zero.</div>
                )}
              </div>
              <div style={{padding:'13px 22px', borderTop:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', justifyContent:'flex-end', gap:8, background:'#fff'}}>
                <AdmButton variant="ghost" size="md" onClick={()=>{ setByupPopup(null); setByupAmount(''); }}>Annulla</AdmButton>
                {sub
                  ? <AdmButton variant="danger" size="md" icon="x" disabled={!byupValid} onClick={confirmByup}>Storna {byupValid ? fmtNum(byupN) : ''}</AdmButton>
                  : <AdmButton variant="primary" size="md" icon="check" disabled={!byupValid} onClick={confirmByup}>Carica {byupValid ? fmtNum(byupN) : ''}</AdmButton>}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ═══ Sospensione recensioni: il popup condiviso con la moderazione (P-88) ═══ */}
        {banPopup === 'sospendi' && (
          <SospensionePopup utente={u} onClose={()=>setBanPopup(null)} onConferma={()=>{ setSospeso(true); setBanPopup(null); }}/>
        )}

        {/* ═══ Popup conferma: ban / rimozione ban / revoca sospensione ═══ */}
        {banPopup && banPopup !== 'sospendi' && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setBanPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:410, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              {banPopup === 'rimuovi-sospensione' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere la sospensione a {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  Può di nuovo pubblicare recensioni prima della scadenza; quelle già pubblicate restano come sono. La sospensione resta nel registro come revocata, con le note già scritte.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" onClick={confirmBan}>Rimuovi sospensione</AdmButton>
                </div>
              </>) : banPopup === 'ban' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Bannare {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</strong> viene <strong style={{color:ADM.DANGER}}>bloccato</strong>: niente più accesso all'app, ordini, prenotazioni o recensioni. L'azione è reversibile e viene registrata nell'audit log.
                </div>
                {/* Il motivo (P-156.7): obbligatorio nel modello, come dalla moderazione. */}
                <textarea value={banMotivo} onChange={e => setBanMotivo(e.target.value)} rows={2} placeholder="Motivo del blocco (obbligatorio): che cosa è successo, in una riga"
                  style={{width:'100%', boxSizing:'border-box', marginBottom:14, padding:'9px 11px', borderRadius:9, border:`1px solid ${ADM.BORDER}`, fontFamily:'inherit', fontSize:13, color:ADM.TEXT, resize:'vertical'}}/>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="danger" size="md" icon="lock" disabled={!banMotivo.trim()} onClick={confirmBan}>Banna utente</AdmButton>
                </div>
              </>) : (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere il ban a {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  L'account torna pienamente operativo: accesso, ordini e recensioni. Anche questa azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" onClick={confirmBan}>Rimuovi ban</AdmButton>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: eliminazione account ═══ */}
        {deletePopup && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setDeletePopup(false)}>
            <div onClick={e=>e.stopPropagation()} style={{width:400, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Eliminare l'account di {form.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</strong> e tutti i suoi dati (ordini, byuppini, preferenze) verranno rimossi in modo <strong style={{color:ADM.DANGER}}>irreversibile</strong>.
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setDeletePopup(false)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" onClick={confirmDelete}>Elimina definitivamente</AdmButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

