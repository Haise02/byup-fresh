// Desk — la shell: barra in alto, barra degli strumenti a sinistra, pagina
//
// La console si chiamava «byup Spot», poi «Hubble»; dal 17 ottobre 2026 è
// Desk, il CRM di byup (Hubble passa al marketplace dei fornitori).
//
// Dal 20 ottobre 2026 la shell è ridisegnata (riferimento: dashboard CRM a
// schede di vetro su carta calda). Niente più colonna a sinistra:
//   · in alto il marchio, le SEZIONI come linguette (la accesa è una pillola
//     d'inchiostro), e a destra gli strumenti di sempre — cerca, Byuppino,
//     Ambiente (la pillola lilla, grande) e il profilo;
//   · a sinistra, a metà altezza, la barra nera degli strumenti: cercare,
//     creare, chat, attività, riunioni, Byuppino, impostazioni;
//   · in basso al centro l'avviso con «Annulla» (window.deskAvviso);
//   · in basso a destra Byuppino, l'assistente (desk-byuppino.jsx).
// Si entra da Oggi (desk-oggi.jsx).

const { useState: useStateApp } = React;

// ─── La nav ─────────────────────────────────────────────────────────────────
// Alcune voci hanno dei FIGLI. Passandoci sopra si apre un pannello a fianco
// con le sotto-sezioni, ciascuna con la sua riga di spiegazione: «Elenchi» da
// solo non dice se sono cartelle o segmenti, e una voce di menu che va provata
// per capire cosa fa è una voce di menu scritta male.
// Cliccando la voce madre si va comunque alla prima figlia — il flyout è una
// scorciatoia, non un pedaggio.
const HUB_NAV = [
  // Oggi: la pagina d'ingresso. Cosa c'è da fare, come va, cosa dice Byuppino.
  { id: 'oggi', label: 'Oggi', icon: 'home',
    desc: 'Il punto della giornata: numeri, cose da seguire, il team' },
  { id: 'dashboard', label: 'Analisi', icon: 'chartFill',
    desc: 'Sette letture: locali, valore, utenti, mercato' },
  // Una voce sola per l'anagrafe. Locali, Staff e Utenti App erano tre liste
  // separate, ma chi amministra cerca UNA persona — «di chi è questa mail?» —
  // e non deve sapere in anticipo in quale delle tre vive.
  // Proprietà non è più una figlia: la stessa pagina vive già nel menu del
  // profilo insieme al resto della governance, e due ingressi per la stessa
  // sezione sono un ingresso di troppo.
  { id: 'contatti', label: 'Contatti', icon: 'staffFill', colore: 'PINK',
    figli: [
      { id: 'contatti',  label: 'Contatti',  icon: 'staffFill', desc: 'La rubrica: locali, staff e utenti app insieme' },
      // I locali come schede, con il titolare e i segnali (desk-locali.jsx).
      { id: 'cnt-locali', label: 'Locali',   icon: 'storeFill', desc: 'I locali come schede: titolari, segnali, azioni rapide' },
      { id: 'elenchi',   label: 'Elenchi',   icon: 'listFill',  desc: 'Segmenti che si aggiornano da soli e liste fisse' },
    ] },
  // Sales (20 ottobre 2026): le trattative, per tenerne traccia. Niente team
  // commerciale: una pipeline semplice, il prossimo passo, il diario.
  { id: 'sales', label: 'Sales', icon: 'target',
    desc: 'Le trattative: fasi, valore, prossimo passo' },
  // «Promozioni» era una sezione sola con tre tab dentro. Ora i canali sono
  // quattro e ognuno ha il suo storico, le sue statistiche e il suo modo di
  // costruire un materiale: stanno a pari livello, non annidati in una tendina.
  { id: 'marketing', label: 'Marketing', icon: 'megaphoneFill', colore: 'HUB_MAGENTA',
    figli: [
      { id: 'mkt-mail', label: 'Mail',  icon: 'mailFill', desc: 'Campagne una tantum e modelli automatici' },
      { id: 'mkt-sms',  label: 'SMS',   icon: 'smsFill',  desc: 'Messaggi brevi, subito o programmati' },
      // Posta e push sono un canale solo (D-113, P-156.5): il messaggio ha la
      // sua riga in bacheca, e la notifica sul telefono è in più, a scelta.
      { id: 'mkt-posta', label: 'Messaggi all\'app', icon: 'bellFill', desc: 'La bacheca dell\'app e la campanella del gestionale, con la notifica sul telefono quando serve: servizio e marketing, due corsie' },
      { id: 'mkt-form', label: 'Form',  icon: 'formFill', desc: 'Moduli da pubblicare, con la loro automazione' },
    ] },
  { id: 'workflow', label: 'Workflow', icon: 'flowFill', colore: 'HUB_VIOLA',
    desc: 'Le automazioni: cosa succede, e quando' },
  { id: 'agent', label: 'Agent', icon: 'sparkFill', colore: 'HUB_VIOLA',
    desc: 'Agenti che lavorano sui tuoi dati mentre non guardi' },
  // Una voce sola per l'assistenza. Ticket e chiamate sono lo stesso lavoro
  // fatto su due canali. Il badge somma le due code leggendo le STESSE fonti
  // dei tab — i ticket aperti di COMUNICAZIONI, le chiamate in attesa — così
  // la sidebar non può dire un numero diverso dalla pagina che apre.
  { id: 'assistenza', label: 'Assistenza', icon: 'headsetFill',
    desc: 'Ticket, chiamate, FAQ e guide',
    badge: (COMUNICAZIONI.filter(c => c.stato === 'nuova' || c.stato === 'in_corso').length
          + RICHIAMATE.filter(r => r.stato === 'attesa').length) },
];

// Le voci di governance non stanno più nella barra: vivono nel menu del
// profilo, e da lì sono UNA voce — Impostazioni — distinta internamente in
// Sicurezza e sistemi, Proprietà, Recapiti e domini di invio, Piattaforma. Quattro
// voci di menu per la stessa famiglia erano quattro ingressi da ricordare.
// Piattaforma dentro Impostazioni si vede solo perché chi guarda È il Super
// Admin: per chiunque altro non esiste, come non esiste nella matrice dei
// permessi.
const HUB_MENU_PROFILO = [
  { id: 'profilo',      label: 'Il mio profilo', icon: 'user',     desc: 'Password, 2FA, sessioni attive' },
  { id: 'impostazioni', label: 'Impostazioni',   icon: 'settings', desc: 'Sicurezza e sistemi, proprietà, recapiti e domini di invio — e Piattaforma' },
];

// Le voci interne di Impostazioni. Le pagine restano quelle di prima: qui
// vive solo l'ingresso comune, e ognuna continua a presentarsi da sola.
const HUB_IMPOSTAZIONI_VOCI = [
  { id: 'sicurezza',   label: 'Sicurezza e sistemi' },
  { id: 'proprieta',   label: 'Proprietà' },
  { id: 'domini',      label: 'Recapiti e domini di invio' },
  { id: 'piattaforma', label: 'Piattaforma' },
];

function ImpostazioniPage({ sub, teamTab }) {
  // «Piattaforma è del solo Super Admin» non era applicata (P-156.2): la
  // linguetta stava nell'elenco senza controllo di ruolo, e nel mock non si
  // vedeva perché chi guarda è il Super Admin. Ora compare solo a lui; con
  // `?ruolo=support` sparisce, e un rimando diretto alla vista riservata
  // ricade su Sicurezza. La riga che lo dichiara resta, per chi la vede.
  const me = hubUtenteCorrente();
  const superAdmin = me.ruolo === 'super_admin';
  const voci = HUB_IMPOSTAZIONI_VOCI.filter(v => v.id !== 'piattaforma' || superAdmin);
  const [vista, setVista] = useStateApp(sub && voci.some(v => v.id === sub) ? sub : 'sicurezza');
  // Un link esterno (⌘K, un avviso) può cambiare la parte interna mentre la
  // pagina è già montata: la prop comanda, lo stato segue.
  React.useEffect(() => { if (sub) setVista(voci.some(v => v.id === sub) ? sub : 'sicurezza'); }, [sub]);
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100%'}}>
      <div style={{padding:'20px 28px 0', display:'flex', alignItems:'center', gap:14}}>
        <HubSegmenti attivo={vista} onCambia={setVista} voci={voci}/>
        <div style={{flex:1}}/>
        {superAdmin && (
          <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12.4, color:ADM.MUTED_SOFT, whiteSpace:'nowrap'}}>
            <BuIcons.lock size={13}/> Piattaforma è visibile solo a te (Super Admin)
          </span>
        )}
      </div>
      {vista === 'sicurezza'   && <AdmTeamPage search={''} initialTab={teamTab} sezione="sicurezza"/>}
      {vista === 'proprieta'   && <HubProprietaPage/>}
      {vista === 'domini'      && <HubDominiPage/>}
      {vista === 'piattaforma' && superAdmin && <AdmTeamPage search={''} initialTab={teamTab} sezione="impostazioni"/>}
    </div>
  );
}

// ─── La barra in alto ───────────────────────────────────────────────────────
// Dal 20 ottobre 2026 Desk non ha più la colonna a sinistra: le sezioni sono
// linguette in alto, come si legge una pagina, e quella accesa è una pillola
// d'inchiostro. Lo spazio guadagnato va tutto al lavoro. Le voci con figli
// aprono il loro pannello sotto la linguetta, al passaggio del mouse, e dentro
// la pagina ritornano come una fila di pillole (DeskSottoNav).
function DeskLinguetta({ item, attiva, onClick, onFly, flyAperto }) {
  const hasBadge = item.badge !== undefined && item.badge > 0;
  const [sopra, setSopra] = useStateApp(false);
  return (
    <button onClick={onClick} className="desk-linguetta"
      onMouseEnter={(e) => { setSopra(true); onFly && onFly(item, e.currentTarget); }}
      onMouseLeave={() => setSopra(false)}
      style={{
        position:'relative', display:'inline-flex', alignItems:'center', gap:7,
        padding:'9px 16px', borderRadius:999, border:'none', cursor:'pointer', fontFamily:'inherit',
        fontSize:14.6, fontWeight: attiva ? 650 : 560, letterSpacing:'-0.01em', whiteSpace:'nowrap',
        background: attiva ? ADM.INCHIOSTRO : (sopra || flyAperto) ? 'rgba(255,255,255,0.7)' : 'transparent',
        color: attiva ? '#fff' : ADM.TEXT,
        boxShadow: attiva ? '0 10px 22px -12px rgba(29,21,32,0.7)' : 'none',
        transition:'background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease',
      }}>
      {item.label}
      {hasBadge && (
        <span style={{
          fontSize:11.5, fontWeight:800, background: ADM.PINK, color:'#fff',
          padding:'1px 6px', borderRadius:99, minWidth:18, textAlign:'center', lineHeight:'16px',
        }}>{item.badge}</span>
      )}
      {item.figli && (
        <span style={{display:'inline-flex', opacity: attiva ? 0.7 : 0.45, transform: flyAperto ? 'rotate(180deg)' : 'none', transition:'transform 0.16s ease'}}>
          <BuIcons.chevronDown size={13} strokeWidth={2.4}/>
        </span>
      )}
    </button>
  );
}

// Il pannello che si apre sotto la linguetta. Una riga per figlio: icona in
// una bolla, nome e la riga che dice a cosa serve.
function HubFlyout({ voce, x, y, onVai, onEnter, onLeave, rotta }) {
  if (!voce || !voce.figli) return null;
  const tinta = ADM[voce.colore] || ADM.PINK;
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        position:'fixed', left:x, top:y, zIndex:150, width:340,
        background:'rgba(255,255,255,0.94)', border:`1px solid ${ADM.GLASS_BORDO}`, borderRadius:24,
        backdropFilter:'blur(22px) saturate(160%)', WebkitBackdropFilter:'blur(22px) saturate(160%)',
        boxShadow:'0 30px 70px -24px rgba(42,26,40,0.42)',
        padding:8, animation:'hubFlyIn 0.15s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
      {voce.figli.map(f => {
        const Icona = BuIcons[f.icon];
        const attiva = rotta === f.id;
        return (
          <button key={f.id} onClick={() => onVai(f.id)} className="adm-actionrow"
            style={{
              display:'flex', alignItems:'flex-start', gap:12, width:'100%', textAlign:'left',
              padding:'10px 11px', borderRadius:16, border:'none', cursor:'pointer', fontFamily:'inherit',
              background: attiva ? 'rgba(73,40,68,0.06)' : 'transparent',
            }}>
            <span style={{
              width:38, height:38, borderRadius:'50%', flexShrink:0, display:'grid', placeItems:'center',
              background: attiva ? ADM.INCHIOSTRO : '#fff', color: attiva ? '#fff' : tinta,
              boxShadow: attiva ? 'none' : '0 6px 14px -9px rgba(73,40,68,0.5)',
            }}><Icona size={18}/></span>
            <span style={{flex:1, minWidth:0, paddingTop:1}}>
              <span style={{display:'block', fontSize:14.4, fontWeight:700, color: ADM.TEXT, letterSpacing:'-0.01em'}}>{f.label}</span>
              <span style={{display:'block', fontSize:12.4, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{f.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Le sorelle della pagina corrente, dentro la pagina: Contatti · Elenchi,
// Mail · SMS · Messaggi all'app · Form.
function DeskSottoNav({ rotta, onVai }) {
  const madre = HUB_NAV.find(v => v.figli && v.figli.some(f => f.id === rotta));
  if (!madre) return null;
  return (
    <div style={{display:'flex', alignItems:'center', gap:6, padding:'14px 28px 0', flexWrap:'wrap'}}>
      {madre.figli.map(f => {
        const Icona = BuIcons[f.icon];
        const on = f.id === rotta;
        return (
          <button key={f.id} onClick={() => onVai(f.id)} title={f.desc} style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'7px 14px 7px 8px', borderRadius:999,
            border:`1px solid ${on ? 'transparent' : 'rgba(255,255,255,0.8)'}`, cursor:'pointer', fontFamily:'inherit',
            background: on ? '#fff' : 'rgba(255,255,255,0.45)', color: ADM.TEXT,
            fontSize:13.6, fontWeight: on ? 700 : 600,
            boxShadow: on ? '0 10px 24px -14px rgba(73,40,68,0.5)' : 'none',
          }}>
            <span style={{width:26, height:26, borderRadius:'50%', display:'grid', placeItems:'center', background: on ? ADM.INCHIOSTRO : 'rgba(255,255,255,0.9)', color: on ? '#fff' : ADM.MUTED}}>
              <Icona size={14}/>
            </span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// La barra degli strumenti: la pillola nera che galleggia a sinistra, a metà
// altezza. Sono le cose che si fanno da qualunque pagina — cercare, creare,
// la chat, le attività, le riunioni, chiedere a Byuppino — e non sezioni:
// per questo non stanno nelle linguette.
function DeskBinario({ onCerca, onAmbiente, onImpostazioni, rotta }) {
  const [crea, setCrea] = useStateApp(false);
  const voci = [
    { id: 'cerca',    icona: 'search',      label: 'Cerca  ⌘K', fa: onCerca },
    { id: 'crea',     icona: 'plus',        label: 'Crea',      fa: () => setCrea(c => !c), acceso: crea },
    { sep: true },
    { id: 'chat',     icona: 'chatFill',    label: 'Chat del team',    fa: () => onAmbiente('oggi') },
    { id: 'attivita', icona: 'checkSquare', label: 'Attività',         fa: () => onAmbiente('attivita') },
    { id: 'riunioni', icona: 'video',       label: 'Riunioni',         fa: () => onAmbiente('riunioni') },
    { sep: true },
    { id: 'byuppino', icona: 'sparkles',    label: 'Chiedi a Byuppino  ⌘J', fa: () => window.byuppinoApri && window.byuppinoApri() },
    { id: 'impost',   icona: 'settings',    label: 'Impostazioni',     fa: onImpostazioni, acceso: rotta === 'impostazioni' },
  ];
  const creaVoci = [
    { icona: 'checkSquare', t: 'Un\'attività', s: 'Byuppino la scrive e la assegna', fa: () => window.byuppinoApri && window.byuppinoApri('Crea un\'attività: ') },
    { icona: 'video',       t: 'Una riunione', s: 'Con chi, quando, in quale canale', fa: () => window.byuppinoApri && window.byuppinoApri('Fissa una riunione con ') },
    { icona: 'hash',        t: 'Un messaggio in un canale', s: 'Scrivi senza aprire Ambiente', fa: () => window.byuppinoApri && window.byuppinoApri('Scrivi in #generale: ') },
    { icona: 'mail',        t: 'Una campagna mail', s: 'Apre Marketing · Mail', fa: () => window.hubVai && window.hubVai('mkt-mail') },
  ];
  return (
    // Niente transform sul contenitore: un antenato trasformato farebbe da
    // riferimento ai figli `position:fixed`, e il velo che chiude il menu
    // «Crea» coprirebbe solo la barra invece di tutta la finestra.
    <div style={{position:'absolute', left:18, top:0, bottom:0, zIndex:60, display:'flex', alignItems:'center', pointerEvents:'none'}}>
     <div style={{position:'relative', pointerEvents:'auto'}}>
      <div style={{
        width:54, padding:'9px 0', borderRadius:999, background:ADM.INCHIOSTRO,
        boxShadow:'0 24px 50px -20px rgba(29,21,32,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset',
        display:'flex', flexDirection:'column', alignItems:'center', gap:4,
      }}>
        {voci.map((v, i) => v.sep
          ? <span key={'s' + i} style={{width:22, height:1, background:'rgba(255,255,255,0.14)', margin:'5px 0'}}/>
          : (
            <button key={v.id} onClick={v.fa} className="desk-binario-btn" data-label={v.label} aria-label={v.label}
              style={{
                width:40, height:40, borderRadius:'50%', border:'none', cursor:'pointer', display:'grid', placeItems:'center',
                background: v.acceso ? '#fff' : 'transparent', color: v.acceso ? ADM.INCHIOSTRO : 'rgba(255,255,255,0.72)',
              }}>
              {v.id === 'byuppino'
                ? <img src="byuppino-viso.webp" alt="" style={{width:30, height:30, borderRadius:'50%', display:'block', background:'#E9D3E6'}}/>
                : React.createElement(BuIcons[v.icona], { size: 19, strokeWidth: 1.9 })}
            </button>
          ))}
      </div>
      {crea && (
        <React.Fragment>
          <div onClick={() => setCrea(false)} style={{position:'fixed', inset:0, zIndex:61}}/>
          <div style={{
            position:'absolute', left:66, top:0, zIndex:62, width:300, padding:8, borderRadius:24,
            background:'rgba(255,255,255,0.95)', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
            boxShadow:'0 30px 70px -24px rgba(42,26,40,0.42)', border:`1px solid ${ADM.GLASS_BORDO}`,
            animation:'hubFlyIn 0.15s cubic-bezier(0.34,1.2,0.64,1)',
          }}>
            <div style={{padding:'8px 12px 6px', fontSize:12.4, fontWeight:700, color:ADM.MUTED}}>Crea</div>
            {creaVoci.map(c => (
              <button key={c.t} className="adm-actionrow" onClick={() => { setCrea(false); c.fa(); }} style={{
                display:'flex', alignItems:'center', gap:11, width:'100%', textAlign:'left', padding:'9px 10px',
                borderRadius:16, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
              }}>
                <span style={{width:36, height:36, borderRadius:'50%', display:'grid', placeItems:'center', background:'#fff', boxShadow:'0 6px 14px -9px rgba(73,40,68,0.5)', color:ADM.TEXT, flexShrink:0}}>
                  {React.createElement(BuIcons[c.icona], { size: 17 })}
                </span>
                <span style={{minWidth:0}}>
                  <span style={{display:'block', fontSize:14, fontWeight:700, color:ADM.TEXT}}>{c.t}</span>
                  <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:1}}>{c.s}</span>
                </span>
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
     </div>
    </div>
  );
}

// L'avviso in basso, con «Annulla»: chiunque lo chiama con window.deskAvviso.
// Le azioni che cambiano i dati — soprattutto quelle che fa Byuppino — lo
// usano per dire cosa è successo e per tornare indietro con un tocco.
const DESK_AVVISI = { ascolta: null };
function deskAvviso(a) { if (DESK_AVVISI.ascolta) DESK_AVVISI.ascolta(Object.assign({ id: Date.now() }, a)); }
window.deskAvviso = deskAvviso;
function DeskAvviso() {
  const [av, setAv] = useStateApp(null);
  React.useEffect(() => {
    DESK_AVVISI.ascolta = (a) => setAv(a);
    return () => { DESK_AVVISI.ascolta = null; };
  }, []);
  React.useEffect(() => {
    if (!av) return;
    const t = setTimeout(() => setAv(null), av.durata || 5200);
    return () => clearTimeout(t);
  }, [av]);
  if (!av) return null;
  return (
    <div key={av.id} style={{
      position:'absolute', left:'50%', bottom:26, transform:'translateX(-50%)', zIndex:180,
      display:'flex', alignItems:'center', gap:12, padding:'8px 8px 8px 18px', borderRadius:999,
      background:ADM.INCHIOSTRO, color:'#fff', boxShadow:'0 24px 50px -18px rgba(29,21,32,0.7)',
      fontSize:14, fontWeight:600, whiteSpace:'nowrap', animation:'deskAvvisoIn 0.28s cubic-bezier(0.34,1.4,0.64,1)',
    }}>
      <BuIcons.check size={16} strokeWidth={2.4}/>
      <span>{av.testo}</span>
      {av.annulla
        ? <button onClick={() => { av.annulla(); setAv(null); }} style={{border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13.4, fontWeight:800, padding:'7px 14px', borderRadius:999, background:ADM.DESK_LILLA, color:ADM.DESK_PRUGNA}}>Annulla</button>
        : <span style={{width:6}}/>}
    </div>
  );
}

// ─── Ricerca globale (⌘K): locali, utenti, staff, ticket ───────────────────────────────
function GlobalSearch({ onClose, go }) {
  const [q, setQ] = useStateApp('');
  const query = q.trim().toLowerCase();
  const match = (...fields) => fields.some(x => String(x || '').toLowerCase().includes(query));
  const results = query.length < 2 ? [] : [
    { group:'Locali', icon:'storeFill', items: LOCALI.filter(l => match(l.nome, l.citta, l.id, l.titolare)).slice(0,5)
        .map(l => ({ key:l.id, title:l.nome, sub:`${admTipoLabel(l.tipo)} · ${l.citta} · ${l.id}`, go:()=>go('locali',{openLocale:l}) })) },
    { group:'Utenti App', icon:'phoneFill', items: (window.UTENTI||[]).filter(u => match(u.nome, u.citta, u.id, u.email)).slice(0,5)
        .map(u => ({ key:u.id, title:u.nome, sub:`${u.citta} · ${u.id}`, go:()=>go('utenti',{openUtente:u}) })) },
    { group:'Utenti Staff', icon:'staffFill', items: (typeof STAFF !== 'undefined' ? STAFF : []).filter(st => match(st.nome, st.localeNome, st.id)).slice(0,5)
        .map(st => ({ key:st.id, title:st.nome, sub:`${st.localeNome} · ${st.id}`, go:()=>go('camerieri',{openStaff:st}) })) },
    { group:'Ticket', icon:'ticketFill', items: (typeof COMUNICAZIONI !== 'undefined' ? COMUNICAZIONI : []).filter(c => match(c.oggetto, c.senderName, c.id)).slice(0,5)
        .map(c => ({ key:c.id, title:c.oggetto, sub:`${c.senderName} · ${c.id}`, go:()=>go('comunicazioni',{openComm:c.id}) })) },
    // Il numero di telefono è indicizzato apposta: capita di avere il display
    // acceso con un numero che richiama e di dover capire chi è.
    { group:'Chiamate', icon:'headsetFill', items: RICHIAMATE.filter(r => match(r.localeNome, r.titolare, r.tel, r.problema, r.id)).slice(0,5)
        .map(r => ({ key:r.id, title:`${r.localeNome} · ${r.tel}`, sub:`${SRV_CATEGORIE[r.categoria].label} · ${r.id}`, go:()=>go('assistenza',{tab:'richiamate'}) })) },
    { group:'FAQ e guide', icon:'chatFill', items: [
        ...FAQ_SRV.filter(f => match(f.domanda, f.risposta, f.categoria)).slice(0,3)
          .map(f => ({ key:f.id, title:f.domanda, sub:`FAQ · ${f.categoria}`, go:()=>go('assistenza',{tab:'faq'}) })),
        ...GUIDE_SRV.filter(g => match(g.titolo, g.descrizione)).slice(0,3)
          .map(g => ({ key:g.id, title:g.titolo, sub:`Guida · ${(GUIDE_ARGOMENTI.find(a=>a.id===g.argomentoId)||{}).nome || '—'}`, go:()=>go('assistenza',{tab:'guide'}) })),
      ] },
  ].filter(g => g.items.length > 0);
  const flat = results.flatMap(g => g.items);
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, zIndex:90, background:'rgba(15,17,21,0.40)', backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', justifyContent:'center', alignItems:'flex-start', paddingTop:110}}>
      <div onClick={e=>e.stopPropagation()} style={{width:620, maxWidth:'92%', background:'#fff', borderRadius:16, boxShadow:'0 32px 80px rgba(15,17,21,0.35)', overflow:'hidden', animation:'admModalIn 0.18s ease'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'14px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
          <BuIcons.search size={19} color={ADM.MUTED}/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if (e.key === 'Enter' && flat[0]) { flat[0].go(); onClose(); } }}
            placeholder="Cerca locali, utenti, staff, ticket…"
            style={{flex:1, border:'none', outline:'none', fontSize:15.5, fontFamily:'inherit', color:ADM.TEXT, background:'transparent'}}/>
          <span style={{fontSize:11, fontWeight:700, background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, borderRadius:5, padding:'2px 6px', color:ADM.MUTED_SOFT}}>ESC</span>
        </div>
        <div style={{maxHeight:420, overflowY:'auto'}}>
          {query.length < 2 && (
            <div style={{padding:'26px 18px', textAlign:'center', fontSize:13, color:ADM.MUTED}}>Digita almeno 2 caratteri · Invio apre il primo risultato</div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div style={{padding:'26px 18px', textAlign:'center', fontSize:13, color:ADM.MUTED}}>Nessun risultato per "{q}"</div>
          )}
          {results.map(g => {
            const GIcon = BuIcons[g.icon];
            return (
              <div key={g.group}>
                <div style={{padding:'9px 18px 5px', fontSize:11, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em'}}>{g.group}</div>
                {g.items.map(it => (
                  <button key={it.key} className="adm-actionrow" onClick={()=>{ it.go(); onClose(); }} style={{
                    display:'flex', alignItems:'center', gap:11, width:'100%', textAlign:'left',
                    padding:'9px 18px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit',
                  }}>
                    <span style={{width:28, height:28, borderRadius:7, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}><GIcon size={15}/></span>
                    <span style={{flex:1, minWidth:0}}>
                      <span style={{display:'block', fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.title}</span>
                      <span style={{display:'block', fontSize:12, color:ADM.MUTED, marginTop:1}}>{it.sub}</span>
                    </span>
                    <BuIcons.chevronRight size={14} color={ADM.MUTED_LIGHT}/>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminApp({ tweaks }) {
  // ?rotta=ambiente (o un'altra rotta) apre la console direttamente lì: serve
  // a condividere un link alla sezione giusta senza spiegare dove cliccare.
  // Senza rotta si entra da Oggi, la pagina che dice cosa c'è da fare.
  const [route, setRouteRaw] = useStateApp(() => {
    try { return new URLSearchParams(window.location.search).get('rotta') || 'oggi'; } catch (e) { return 'oggi'; }
  });
  const [contattoOpen, setContattoOpen] = useStateApp(null); // {tipo, ref} → drawer in Contatti
  const [commOpen, setCommOpen] = useStateApp(null);
  const [assistenzaTab, setAssistenzaTab] = useStateApp(null); // tab di Chiamata assistenza (ricerca globale, Dashboard)
  const [teamTab, setTeamTab] = useStateApp(null);   // tab di Sicurezza/Piattaforma aperta da un link esterno
  const [impostazioniSub, setImpostazioniSub] = useStateApp('sicurezza'); // parte interna di Impostazioni
  const [searchOpen, setSearchOpen] = useStateApp(false);
  // Il pannello sotto le linguette: {voce, x, y}. Vive qui perché sta sopra a
  // tutto (position:fixed) e la barra non lo deve tagliare.
  const [fly, setFly] = useStateApp(null);
  const [menuProfilo, setMenuProfilo] = useStateApp(false);
  // «Esci da Desk»: il logout è finto ma l'esito è vero — la shell sparisce
  // dietro un velo e si rientra da dove si entra sempre.
  const [uscito, setUscito] = useStateApp(false);
  // Il ritardo di chiusura: senza, il pannello sparisce nel millimetro di
  // vuoto tra la linguetta e la card, e non ci si arriva mai col mouse.
  const flyTimer = React.useRef(null);
  const apriFly = (voce, el) => {
    clearTimeout(flyTimer.current);
    if (!voce.figli) { setFly(null); return; }
    const r = el.getBoundingClientRect();
    // Il frame è scalato con `zoom`: i rect sono pixel VISIVI e il pannello,
    // essendo dentro lo stesso frame, li vuole di LAYOUT. Si divide per lo zoom.
    const z = (() => { const f = document.querySelector('.frame'); const v = f && parseFloat(f.style.zoom); return v > 0 ? v : 1; })();
    setFly({ voce, x: Math.max(12, (r.left / z) - 10), y: (r.bottom / z) + 8 });
  };
  const chiudiFly = () => { clearTimeout(flyTimer.current); flyTimer.current = setTimeout(() => setFly(null), 180); };
  const tieniFly = () => clearTimeout(flyTimer.current);
  React.useEffect(() => () => clearTimeout(flyTimer.current), []);

  // ⌘K / Ctrl+K apre la ricerca globale ovunque
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // setRoute esteso: setRoute('locali', { openLocale: l }) apre direttamente
  // il drawer di dettaglio sul locale passato. Navigando altrove o tornando
  // sulla rubrica senza opts, il prefill è azzerato.
  //
  // I ticket non hanno più una rotta propria: sono un tab di Assistenza. E
  // locali, camerieri e utenti non hanno più una pagina propria: sono la
  // rubrica Contatti. Qui le rotte vecchie si traducono nelle nuove, così le
  // notifiche, la ricerca globale e Byuppino continuano a puntare dove
  // puntavano senza doverle riscrivere una per una.
  const setRoute = (nextRaw, opts) => {
    const verso = nextRaw === 'comunicazioni' ? 'assistenza'
      : (nextRaw === 'locali' || nextRaw === 'camerieri' || nextRaw === 'utenti') ? 'contatti'
      // «Marketing» non è una pagina: è una famiglia. Chi ci arriva senza dire
      // quale canale atterra sulla mail, che è quello da cui si parte.
      : nextRaw === 'marketing' ? 'mkt-mail'
      : nextRaw === 'promozioni' ? 'mkt-mail'
      // La governance è una voce sola: le quattro rotte storiche atterrano
      // dentro Impostazioni, sulla loro parte interna.
      : (nextRaw === 'sicurezza' || nextRaw === 'team' || nextRaw === 'domini' || nextRaw === 'proprieta') ? 'impostazioni'
      : nextRaw;
    setFly(null); setMenuProfilo(false);
    const tab = nextRaw === 'comunicazioni' ? 'ticket' : (opts && opts.tab) || null;
    setContattoOpen(verso !== 'contatti' || !opts ? null
      : opts.openLocale ? { tipo: 'locale', ref: opts.openLocale, tab: opts.tab || null, pratica: opts.pratica || null }
      : opts.openStaff ? { tipo: 'staff', ref: opts.openStaff }
      : opts.openUtente ? { tipo: 'utente', ref: opts.openUtente }
      : opts.openContatto || null);
    setCommOpen(verso === 'assistenza' && opts?.openComm ? opts.openComm : null);
    setAssistenzaTab(verso === 'assistenza' ? tab : null);
    if (verso === 'impostazioni') {
      setTeamTab(tab || null);
      setImpostazioniSub(nextRaw === 'team' ? 'piattaforma'
        : nextRaw === 'impostazioni' ? ((opts && opts.sub) || 'sicurezza')
        : nextRaw);
    }
    setRouteRaw(verso);
    // La pagina nuova parte dall'alto.
    const sc = document.querySelector('.desk-scorre'); if (sc) sc.scrollTop = 0;
  };
  // La rotta si può chiamare da fuori dalla shell (P-172: il ticket apre la pratica nella scheda del locale).
  window.hubVai = setRoute;
  window.hubRotta = route;
  React.useEffect(() => { window.__hubNav = setRoute; return () => { delete window.__hubNav; }; });

  const apriAmbiente = (vista) => { if (typeof dkApri === 'function') dkApri(vista); setRoute('ambiente'); };
  const profiloAcceso = menuProfilo || HUB_MENU_PROFILO.some(v => v.id === route);

  return (
    <div className="frame" style={{
      display:'flex', flexDirection:'column', overflow:'hidden',
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      background: ADM.FONDO_PAGINA, color: ADM.TEXT,
    }}>
      <HubStile/>

      {/* ─── La barra in alto: marchio, linguette, strumenti ─────────────── */}
      <header style={{display:'flex', alignItems:'center', gap:18, padding:'16px 24px 10px 26px', flexShrink:0, position:'relative', zIndex:70}}>
        <button onClick={() => setRoute('oggi')} title="Oggi" style={{border:'none', background:'transparent', padding:'4px 6px 4px 0', cursor:'pointer', display:'flex', alignItems:'center'}}>
          <img src="desk.png" alt="Desk" style={{height:28, width:'auto', display:'block'}}/>
        </button>

        <nav onMouseLeave={chiudiFly} style={{display:'flex', alignItems:'center', gap:2, padding:4, borderRadius:999, background:'rgba(255,255,255,0.42)', border:'1px solid rgba(255,255,255,0.7)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)'}}>
          {HUB_NAV.map(item => {
            const figlio = item.figli && item.figli.some(f => f.id === route);
            return (
              <DeskLinguetta key={item.id} item={item}
                attiva={route === item.id || figlio}
                flyAperto={!!fly && fly.voce.id === item.id}
                onClick={() => setRoute(item.figli ? item.figli[0].id : item.id)}
                onFly={apriFly}/>
            );
          })}
        </nav>

        <div style={{flex:1}}/>

        <DeskCampanella/>
        <button onClick={() => setSearchOpen(true)} className="desk-cerchio" data-tip="Cerca ovunque · ⌘K" data-tip-pos="below" aria-label="Cerca">
          <BuIcons.search size={18} strokeWidth={2}/>
        </button>
        {/* Ambiente: il posto dove il team sta tutto il giorno. Non è una
            sezione del CRM e non sta tra le linguette: è la pillola lilla,
            grande, con chi c'è e cosa ti aspetta. */}
        <DkAmbientePillola attivo={route === 'ambiente'} onClick={() => setRoute('ambiente')}/>

        <div style={{position:'relative'}}>
          <button onClick={() => setMenuProfilo(m => !m)} title="Profilo e impostazioni" style={{
            width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer', padding:0,
            background: ADM.HUB_GRAD_DIAG, color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:14.5,
            boxShadow: profiloAcceso ? `0 0 0 3px #fff, 0 0 0 5px ${ADM.INCHIOSTRO}` : '0 0 0 3px rgba(255,255,255,0.9), 0 10px 20px -12px rgba(73,40,68,0.6)',
          }}>MR</button>
          {menuProfilo && (
            <React.Fragment>
              <div onClick={()=>setMenuProfilo(false)} style={{position:'fixed', inset:0, zIndex:140}}/>
              <div style={{
                position:'absolute', top:'calc(100% + 10px)', right:0, zIndex:145, width:300,
                background:'rgba(255,255,255,0.96)', border:`1px solid ${ADM.GLASS_BORDO}`, borderRadius:24,
                backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
                boxShadow:'0 30px 70px -24px rgba(42,26,40,0.42)', padding:8,
                animation:'hubFlyIn 0.15s cubic-bezier(0.34,1.2,0.64,1)',
              }}>
                <div style={{display:'flex', alignItems:'center', gap:11, padding:'10px 10px 12px'}}>
                  <span style={{width:40, height:40, borderRadius:'50%', background:ADM.HUB_GRAD_DIAG, color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:14}}>MR</span>
                  <span style={{minWidth:0}}>
                    <span style={{display:'block', fontSize:14.6, fontWeight:700, color:ADM.TEXT}}>Marco Rinaldi</span>
                    <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:1}}>Super Admin · byup</span>
                  </span>
                </div>
                {HUB_MENU_PROFILO.map(v => {
                  const Icona = BuIcons[v.icon];
                  const attiva = route === v.id;
                  return (
                    <button key={v.id} onClick={()=>setRoute(v.id)} className="adm-actionrow"
                      style={{
                        display:'flex', alignItems:'flex-start', gap:11, width:'100%', textAlign:'left',
                        padding:'9px 10px', borderRadius:16, border:'none', cursor:'pointer', fontFamily:'inherit',
                        background: attiva ? 'rgba(73,40,68,0.06)' : 'transparent',
                      }}>
                      <span style={{
                        width:34, height:34, borderRadius:'50%', flexShrink:0, display:'grid', placeItems:'center',
                        background: attiva ? ADM.INCHIOSTRO : '#fff', color: attiva ? '#fff' : ADM.MUTED,
                        boxShadow: attiva ? 'none' : '0 6px 14px -9px rgba(73,40,68,0.5)',
                      }}><Icona size={16}/></span>
                      <span style={{flex:1, minWidth:0, paddingTop:1}}>
                        <span style={{display:'block', fontSize:13.8, fontWeight:700, color: ADM.TEXT}}>{v.label}</span>
                        <span style={{display:'block', fontSize:11.8, color:ADM.MUTED, marginTop:1, lineHeight:1.4}}>{v.desc}</span>
                      </span>
                    </button>
                  );
                })}
                <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`, margin:'6px 4px 4px', paddingTop:5}}>
                  <button className="adm-actionrow" onClick={()=>{ setMenuProfilo(false); setUscito(true); }} style={{
                    display:'flex', alignItems:'center', gap:11, width:'100%', textAlign:'left',
                    padding:'8px 10px', borderRadius:16, border:'none', cursor:'pointer',
                    fontFamily:'inherit', background:'transparent',
                  }}>
                    <span style={{width:34, height:34, borderRadius:'50%', display:'grid', placeItems:'center', color:ADM.MUTED}}>
                      <BuIcons.arrowRight size={16}/>
                    </span>
                    <span style={{fontSize:13.8, fontWeight:600, color:ADM.MUTED}}>Esci da Desk</span>
                  </button>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </header>

      {fly && <HubFlyout voce={fly.voce} x={fly.x} y={fly.y} rotta={route}
        onVai={(id)=>setRoute(id)} onEnter={tieniFly} onLeave={chiudiFly}/>}

      {/* ─── Il corpo: la barra nera a sinistra e la pagina ─────────────── */}
      <div style={{flex:1, minHeight:0, position:'relative', display:'flex'}}>
        <DeskBinario rotta={route} onCerca={() => setSearchOpen(true)} onAmbiente={apriAmbiente}
          onImpostazioni={() => setRoute('impostazioni')}/>
        <main style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden', paddingLeft:72}}>
          <div className="desk-scorre" style={{flex:1, overflow: route === 'ambiente' ? 'hidden' : 'auto', display:'flex', flexDirection:'column'}}>
            <DeskSottoNav rotta={route} onVai={setRoute}/>
            <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
              {route === 'oggi'         && <DeskOggiPage onNav={setRoute}/>}
              {route === 'ambiente'     && <div style={{flex:1, minHeight:0, padding:'4px 24px 20px 10px', display:'flex'}}><div className="desk-ambiente-guscio" style={{flex:1, minHeight:0, borderRadius:26, overflow:'hidden', background:'rgba(255,255,255,0.86)', boxShadow:ADM.CARD_SHADOW, border:`1px solid ${ADM.GLASS_BORDO}`, display:'flex'}}><DkAmbientePage/></div></div>}
              {route === 'dashboard'    && <AdmDashboard onNav={setRoute}/>}
              {route === 'contatti'     && <AdmContattiPage search={''} openContatto={contattoOpen}/>}
              {route === 'cnt-locali'   && <DeskLocaliPage/>}
              {route === 'elenchi'      && <HubElenchiPage/>}
              {route === 'sales'        && <DeskSalesPage/>}
              {route === 'mkt-mail'     && <HubMailPage/>}
              {route === 'mkt-sms'      && <HubSmsPage/>}
              {(route === 'mkt-posta' || route === 'mkt-push') && <HubPostaPage/>}
              {route === 'mkt-form'     && <HubFormPage/>}
              {route === 'workflow'     && <HubWorkflowPage/>}
              {route === 'agent'        && <HubAgentPage/>}
              {route === 'assistenza'   && <AdmAssistenzaPage initialTab={assistenzaTab} openTicket={commOpen}/>}
              {route === 'impostazioni' && <ImpostazioniPage sub={impostazioniSub} teamTab={teamTab}/>}
              {route === 'profilo'      && <ProfiloPage/>}
            </div>
          </div>
        </main>
        <DeskAvviso/>
        {/* Le notifiche: cartellini in basso a destra (desk-notifiche.jsx). */}
        <DeskNotifiche/>
      </div>

      {/* Byuppino: l'assistente che risponde e fa le cose (desk-byuppino.jsx). */}
      <DeskByuppino rotta={route} vai={setRoute}/>

      {searchOpen && <GlobalSearch onClose={()=>setSearchOpen(false)} go={(r, opts)=>setRoute(r, opts)}/>}

      {uscito && (
        <div style={{position:'fixed', inset:0, zIndex:200, background:'rgba(42,26,40,0.45)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'grid', placeItems:'center'}}>
          <div style={{width:380, background:'#FDFBFA', borderRadius:28, boxShadow:'0 32px 80px rgba(42,26,40,0.4)', padding:'32px 28px', textAlign:'center', animation:'admModalIn 0.18s ease'}}>
            <img src="desk-mark.png" alt="Desk" style={{height:36, width:'auto', margin:'0 auto 14px', display:'block'}}/>
            <div style={{fontSize:20, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.03em'}}>Sessione terminata</div>
            <div style={{fontSize:13.8, color:ADM.MUTED, marginTop:6, lineHeight:1.5}}>Sei uscito da Desk. Per riprendere il lavoro accedi di nuovo.</div>
            <div style={{marginTop:20, display:'flex', justifyContent:'center'}}>
              <AdmButton variant="primary" size="md" onClick={()=>{ setUscito(false); setRoute('oggi'); }}>Accedi di nuovo</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- PROFILO ----------
function ProfiloPage() {
  const [pwd1, setPwd1] = useStateApp('');
  const [pwd2, setPwd2] = useStateApp('');
  const [pwd3, setPwd3] = useStateApp('');
  const [pwdSalvata, setPwdSalvata] = useStateApp(false);
  const [twofa, setTwofa] = useStateApp(false);
  const [showQr, setShowQr] = useStateApp(false);
  const [codice2fa, setCodice2fa] = useStateApp('');
  const [showCodici, setShowCodici] = useStateApp(false);
  // Le sessioni sono uno stato, non un letterale nel JSX: «Termina» promette
  // un'azione distruttiva e la lista deve accorciarsi davvero.
  const [sessioni, setSessioni] = useStateApp([
    { device:'Mac · Chrome', loc:'Milano', when:'In uso ora', current:true },
    { device:'iPhone · Safari', loc:'Milano', when:'2 ore fa', current:false },
    { device:'Mac · Firefox', loc:'Milano', when:'3 giorni fa', current:false },
  ]);

  const pwdOk = pwd2.length >= 8 && pwd2 === pwd3 && pwd1.length > 0;
  // Stesso metro del cambio password: il codice va letto davvero — sei cifre,
  // gli spazi del formato «123 456» non contano.
  const codice2faOk = /^\d{6}$/.test(codice2fa.replace(/\s/g, ''));

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      {/* La testata alla maniera di Desk: la pagina si presenta da sola —
          la shell non ha più un header con titoli o briciole. */}
      <HubTestata titolo="Il mio profilo"
        sotto="Password, autenticazione a due fattori e sessioni attive: la sicurezza del tuo accesso a Desk."/>
      {/* Header card */}
      <AdmCard padding={22}>
        <div style={{display:'flex', alignItems:'center', gap:18}}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:'linear-gradient(135deg, #FF1F5A, #9E0B3C)',
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:700, fontSize:20, flexShrink:0, letterSpacing:'0.01em',
          }}>MR</div>
          <div style={{flex:1}}>
            <div style={{fontSize:19.4, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Marco Rinaldi</div>
            <div style={{fontSize:14, color:ADM.MUTED, marginTop:3}}>marco.rinaldi@byup.it · Super Admin</div>
            <div style={{fontSize:13.3, color:ADM.MUTED_SOFT, marginTop:4}}>Account creato il 14 gen 2024 · Ultimo accesso oggi alle 09:42</div>
          </div>
        </div>
      </AdmCard>

      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14, alignItems:'start'}}>
      {/* Password */}
      <AdmCard padding={22}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Cambia password</div>
        <div style={{fontSize:13.7, color:ADM.MUTED, marginBottom:16}}>Usa almeno 8 caratteri, con lettere e numeri</div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <ProfField label="Password attuale" type="password" value={pwd1} onChange={setPwd1}/>
          <ProfField label="Nuova password" type="password" value={pwd2} onChange={setPwd2} hint={pwd2.length > 0 && pwd2.length < 8 ? 'Almeno 8 caratteri' : ''}/>
          <ProfField label="Conferma nuova password" type="password" value={pwd3} onChange={setPwd3} hint={pwd3.length > 0 && pwd2 !== pwd3 ? 'Le password non coincidono' : ''}/>
        </div>
        <div style={{marginTop:16, display:'flex', alignItems:'center', gap:10}}>
          {/* Mock: i campi si svuotano — una password salvata non resta sullo
              schermo — e la conferma dura il tempo di leggerla. */}
          <AdmButton variant="primary" size="md" icon="check" disabled={!pwdOk}
            onClick={()=>{ setPwd1(''); setPwd2(''); setPwd3(''); setPwdSalvata(true); setTimeout(()=>setPwdSalvata(false), 2200); }}>Aggiorna password</AdmButton>
          {pwdSalvata && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Password aggiornata</span>}
        </div>
      </AdmCard>

      <div style={{display:'flex', flexDirection:'column', gap:14, minWidth:0}}>
      {/* 2FA */}
      <AdmCard padding={22}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:18, marginBottom: twofa || showQr ? 16 : 0}}>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Autenticazione a due fattori (2FA)</div>
              <span style={{padding:'2px 8px', borderRadius:99, background:ADM.WARN_SOFT, color:'#92400E', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.04em'}}>obbligatoria per gli admin</span>
              {twofa && <AdmBadge color="OK" size="xs">Attiva</AdmBadge>}
            </div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
              Aggiungi un secondo livello di sicurezza al tuo account. Ad ogni accesso ti verrà richiesto un codice generato da un'app come Google Authenticator o Authy.
            </div>
          </div>
          <AdmSwitch checked={twofa} onChange={(v) => { if (twofa && !v) { setTwofa(false); setShowQr(false); setShowCodici(false); } else if (!twofa && v) { setShowQr(true); } }}/>
        </div>

        {showQr && !twofa && (
          <div style={{padding:18, background:ADM.PANEL_SOFT, borderRadius:10, border:`1px solid ${ADM.BORDER}`, display:'flex', gap:18, alignItems:'flex-start'}}>
            <div style={{
              width:140, height:140, background:'#fff',
              border:`1px solid ${ADM.BORDER}`, borderRadius:8, padding:8,
              display:'grid', placeItems:'center', flexShrink:0,
            }}>
              <QrPlaceholder/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>1 · Scansiona il QR code</div>
              <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.5, marginBottom:14}}>
                Apri la tua app di autenticazione (Google Authenticator, Authy, 1Password) e scansiona il codice qui a sinistra. Oppure inserisci la chiave manualmente:
                <div style={{marginTop:8, padding:'8px 10px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:6, fontFamily:'ui-monospace,monospace', fontSize:13.3, color:ADM.TEXT, letterSpacing:'0.06em'}}>JBSW Y3DP EHPK 3PXP</div>
              </div>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>2 · Inserisci il codice a 6 cifre</div>
              <div style={{display:'flex', gap:8}}>
                {/* maxLength 7: sei cifre più lo spazio del formato suggerito
                    dal placeholder. */}
                <input maxLength={7} placeholder="123 456" value={codice2fa} onChange={e=>setCodice2fa(e.target.value)} style={{
                  flex:1, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:15.1, fontFamily:'ui-monospace,monospace', letterSpacing:'0.2em', textAlign:'center', outline:'none',
                }}/>
                <AdmButton variant="primary" size="md" disabled={!codice2faOk} onClick={()=>{ setTwofa(true); setShowQr(false); setCodice2fa(''); }}>Attiva 2FA</AdmButton>
                <AdmButton variant="ghost" size="md" onClick={()=>{ setShowQr(false); setCodice2fa(''); }}>Annulla</AdmButton>
              </div>
            </div>
          </div>
        )}

        {twofa && (
          <div style={{padding:14, background:ADM.OK_SOFT, borderRadius:8, border:`1px solid #BBF7D0`, display:'flex', gap:10, alignItems:'center'}}>
            <BuIcons.check size={21} color={ADM.OK}/>
            <div style={{flex:1, fontSize:14, color:'#065F46'}}>2FA configurata con app Authenticator. Conserva i codici di recupero in un posto sicuro.</div>
            <AdmButton variant="ghost" size="sm" onClick={()=>setShowCodici(c=>!c)}>{showCodici ? 'Nascondi codici' : 'Codici di recupero'}</AdmButton>
          </div>
        )}
        {/* Otto codici fissi, stesso registro monospace della chiave manuale:
            il banner li promette, il bottone li deve mostrare. */}
        {twofa && showCodici && (
          <div style={{marginTop:10, padding:14, background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, borderRadius:8}}>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginBottom:8}}>Ogni codice vale un solo accesso. Conservali fuori dal computer.</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:6}}>
              {['84KF-2Q1D','7PX3-N9RM','QW52-8ZTC','X0DH-44VE','MJ6B-K3PU','5RTN-YB07','CE91-HL2S','ZK38-06WQ'].map(c => (
                <div key={c} style={{padding:'6px 0', textAlign:'center', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:6, fontFamily:'ui-monospace,monospace', fontSize:12.6, letterSpacing:'0.05em', color:ADM.TEXT}}>{c}</div>
              ))}
            </div>
          </div>
        )}
      </AdmCard>

      {/* Sessioni attive */}
      <AdmCard padding={22}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Sessioni attive</div>
        {sessioni.map((s,i,a) => (
          <div key={s.device} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i === a.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{width:32, height:32, borderRadius:7, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center'}}><BuIcons.user size={19}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{s.device}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED}}>{s.loc} · {s.when}</div>
            </div>
            {s.current ? <AdmBadge color="OK" size="xs">Sessione attuale</AdmBadge> : <button className="adm-textlink" onClick={()=>setSessioni(ss => ss.filter(x => x.device !== s.device))} style={{background:'transparent', border:'none', color:ADM.DANGER, fontSize:13.3, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Termina</button>}
          </div>
        ))}
      </AdmCard>
      </div>{/* /colonna destra */}
      </div>{/* /griglia */}
    </div>
  );
}

function ProfField({ label, type='text', value, onChange, hint }) {
  return (
    <div>
      <label style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'-0.005em'}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} style={{
        width:'100%', padding:'10px 13px',
        border:`1px solid ${ADM.BORDER}`,
        background:'#fff',
        borderRadius:9, fontSize:14.8, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
        color:ADM.TEXT, letterSpacing:'-0.005em',
      }}/>
      {hint && <div style={{fontSize:13.3, color:ADM.DANGER, marginTop:5, fontWeight:500}}>{hint}</div>}
    </div>
  );
}

function QrPlaceholder() {
  // mock pixel grid
  const grid = [];
  const r = (i,j) => (Math.sin(i * 7.3 + j * 3.1) + Math.cos(i * 2.7 - j * 5.5)) > 0.1;
  for (let i=0; i<11; i++) for (let j=0; j<11; j++) {
    if (r(i,j)) grid.push({i,j});
  }
  return (
    <svg viewBox="0 0 110 110" width="100%" height="100%">
      {grid.map((c,k) => <rect key={k} x={c.j*10} y={c.i*10} width="10" height="10" fill="#0F1115"/>)}
      {/* corners */}
      {[[0,0],[80,0],[0,80]].map(([x,y],k) => (
        <g key={k}>
          <rect x={x} y={y} width="30" height="30" fill="#0F1115"/>
          <rect x={x+5} y={y+5} width="20" height="20" fill="#fff"/>
          <rect x={x+10} y={y+10} width="10" height="10" fill="#0F1115"/>
        </g>
      ))}
    </svg>
  );
}

window.AdminApp = AdminApp;
