// Staff — il dataset delle utenze staff (STAFF) e la loro scheda (StaffDrawer).
// La lista di sezione non esiste più: si arriva qui dalla rubrica Contatti.

const { useState: useStateCam } = React;

// ─── Mock data: staff per locale ────────────────────────────────────────────
const RUOLI_STAFF = [
  { id: 'cameriere',     label: 'Cameriere',      color: 'INFO',      pct: 0.50 },
  { id: 'cassa',         label: 'Cassa',          color: 'PURPLE',    pct: 0.20 },
  { id: 'proprietario',  label: 'Proprietario',   color: 'PINK',      pct: 0.10 },
  { id: 'personalizzato',label: 'Personalizzato', color: 'WARN',      pct: 0.10 },
  { id: 'dispositivo',   label: 'Dispositivo',    color: 'PLAN_FREE', pct: 0.10 },
];

// I dispositivi sono di due nature — SCHERMI e STAMPANTI — e la scheda le
// distingue nella «Descrizione utenza»: un kitchen monitor e una termica per
// gli scontrini non si sostituiscono a vicenda.
const DEVICE_MONITOR   = ['iPad 10.9"', 'iPad mini', 'Samsung Galaxy Tab A9', 'Elo PayPoint', 'iPad Air'];
const DEVICE_STAMPANTI = ['Epson TM-T20III', 'Star TSP143IV', 'Bixolon SRP-350III', 'Epson TM-m30II'];

// I ruoli personalizzati hanno un NOME dato dal locale: è quello che la
// scheda mostra come «Custom - …», non la parola generica.
const CUSTOM_NOMI = ['Responsabile sala', 'Turno serale', 'Cassa weekend', 'Vice direttore', 'Barman'];

// Aree del gestionale (per i ruoli di tipo "Personalizzato"). P-59 (RL-10):
// le nove su cui gestionale e modello coincidono, copiate da ALL_AREAS di
// gestionale/impostazioni-personale.jsx con le SUE etichette — «Sala e
// prenotazioni» è un'area sola, e qui era spaccata in due; Cucina e App
// cameriere mancavano. Se cambia di là, cambia anche qui.
const AREE_GESTIONALE = ['Panoramica', 'Sala e prenotazioni', 'Vendita diretta', 'Cucina', 'App cameriere', 'Statistiche', 'Contabilità', 'Supporto', 'Impostazioni'];

const STAFF = (() => {
  const nomi = [
    'Luca Bianchi','Sara Conti','Alessandro Romano','Giulia Russo','Federico Marino',
    'Martina Greco','Davide Esposito','Chiara Costa','Andrea Bruno','Elena Galli',
    'Marco Ferrari','Sofia Lombardi','Stefano Moretti','Valentina Barbieri','Tommaso Mancini',
    'Beatrice Rizzo','Filippo Caruso','Aurora Pellegrini','Riccardo Negri','Camilla Serra',
    'Lorenzo Sala','Vittoria Donati','Edoardo Caputo','Ludovica Battaglia','Gabriele Leone',
    'Anna Bellini','Simone Villa','Cristian Vitale','Greta Marini','Diego Bianco',
    'Asia Coppola','Pietro Fontana','Federica Rinaldi','Matteo Santoro','Maria Palumbo',
    'Alberto Giordano','Bianca Ricci','Tommaso Pellegrini','Aurora Marini','Filippo De Luca',
    'Ginevra Romano','Lorenzo Mancini','Beatrice Esposito','Marco Costa','Sara Galli',
    'Davide Bruno','Elena Ferrari','Andrea Lombardi','Giulia Moretti','Stefano Barbieri',
  ];
  const r = (seed) => { let x = (seed * 9301 + 49297) % 233280; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  return nomi.map((n, i) => {
    const rnd = r(i + 500);
    const localeIdx = Math.floor(rnd() * 25) + 17; // assegna a locali attivi (idx 17-41)
    const localeId = 'L' + (1000 + localeIdx);
    const local = LOCALI.find(l => l.id === localeId);
    // Distribuzione ruoli ponderata
    const rRoll = rnd();
    let ruolo;
    let cumulative = 0;
    for (const r of RUOLI_STAFF) { cumulative += r.pct; if (rRoll <= cumulative) { ruolo = r.id; break; } }
    if (!ruolo) ruolo = 'cameriere';
    const lastDays = Math.floor(rnd() * 14);
    const isDevice = ruolo === 'dispositivo';
    // Metà schermi, metà stampanti — stabile sul seed, come tutto il resto.
    const deviceKind = rnd() < 0.5 ? 'monitor' : 'stampante';
    const modello = deviceKind === 'stampante'
      ? DEVICE_STAMPANTI[Math.floor(rnd() * DEVICE_STAMPANTI.length)]
      : DEVICE_MONITOR[Math.floor(rnd() * DEVICE_MONITOR.length)];
    const deviceCode = (deviceKind === 'stampante' ? 'PRN-' : 'KDS-') + localeIdx + '-' + String(11 + (i % 9));
    // Per i ruoli personalizzati: sottoinsieme di aree del gestionale (2-4)
    const aree = ruolo === 'personalizzato'
      ? [...AREE_GESTIONALE].sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 3))
      : null;
    const membro = {
      id: 'S' + String(3000 + i),
      // Per i dispositivi il "nome" è il codice del dispositivo (non una persona)
      nome: isDevice ? deviceCode : n,
      modello: isDevice ? modello : null,
      deviceKind: isDevice ? deviceKind : null,
      customNome: ruolo === 'personalizzato' ? CUSTOM_NOMI[Math.floor(rnd() * CUSTOM_NOMI.length)] : null,
      aree,
      ruolo,
      localeId,
      localeNome: local?.nome || '—',
      localeCitta: local?.citta || '—',
      ordiniMese: Math.floor(rnd() * 280) + 40,
      coperti: Math.floor(rnd() * 380) + 60,
      lastActive: new Date(Date.now() - lastDays * 86400000),
      attivoOggi: lastDays === 0,
      dataAssunzione: new Date(Date.now() - (60 + Math.floor(rnd() * 700)) * 86400000),
    };

    // I campi nuovi si derivano in coda: le chiamate a rnd() vengono DOPO
    // quelle dei campi storici, che così non cambiano valore.
    //
    // L'anagrafica della persona. L'email vive sul dominio del locale
    // PRINCIPALE, lo stesso da cui scrive il titolare; i dispositivi non
    // sono persone — niente email, età o genere.
    const dominio = local && local.email ? local.email.split('@')[1] : null;
    membro.email = (isDevice || !dominio) ? null
      : n.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.') + '@' + dominio;
    // Niente nascita né genere (P-58 · RL-09): il gestionale invita con nome,
    // email e ruolo, e un dato che nessun flusso raccoglie non si inventa per
    // derivazione — il genere «letto dal nome di battesimo» era esattamente
    // questo. L'estrazione resta: i campi che seguono (i locali associati)
    // non devono cambiare valore.
    if (!isDevice) rnd();
    // Il luogo principale della persona: dove sta, non dove timbra. Parte
    // dalla città del locale principale e da lì si corregge in scheda.
    membro.luogo = isDevice ? null : (local?.citta || null);

    // MULTI-LOCALE: un'utenza staff può essere associata a più locali — il
    // titolare con due sedi, il cameriere che gira tra i locali del gruppo.
    // Il PRIMO della lista è il principale, quello che righe e raggruppamenti
    // continuano a mostrare; i dispositivi restano dove sono montati: un
    // locale e basta. Circa un terzo delle persone ne ha più d'uno.
    membro.locali = [{ id: localeId, nome: membro.localeNome, citta: membro.localeCitta }];
    if (!isDevice) {
      if (ruolo === 'proprietario' && local && typeof drwLocaliAssociati === 'function') {
        // Il TITOLARE: il suo gruppo è quello della scheda locale — stessa
        // fonte (drwLocaliAssociati), così le due schede non possono
        // raccontare due liste diverse per la stessa persona.
        membro.locali = drwLocaliAssociati(local);
      } else {
        const extra = rnd() < 0.32 ? 1 + (rnd() < 0.25 ? 1 : 0) : 0;
        for (let k = 0; k < extra; k++) {
          const alt = LOCALI.find(l => l.id === 'L' + (1000 + 17 + Math.floor(rnd() * 25)));
          if (alt && !membro.locali.some(x => x.id === alt.id)) {
            membro.locali.push({ id: alt.id, nome: alt.nome, citta: alt.citta });
          }
        }
      }
    }

    // Le statistiche da sala esistono solo per chi ha un'utenza CAMERIERE:
    // sono loro a prendere ordini, servire coperti e ricevere mance.
    if (ruolo === 'cameriere') {
      membro.scontrinoMedio = 14 + Math.round(rnd() * 52) / 2;          // 14–40 €, a mezzi euro
      membro.manciaMedia = Math.round((0.8 + rnd() * 3.4) * 10) / 10;   // 0,80–4,20 €
    }
    return membro;
  });
})();

// La pagina-lista che viveva qui (AdmCamerieriPage, con la vista per locale
// e i suoi filtri) è stata rimossa: la rotta è tradotta in Contatti da
// admin-app, e nessuno la montava più. Restano le cose VIVE del file: il
// dataset STAFF, la scheda (StaffDrawer) e i suoi attrezzi.

// La «Descrizione utenza»: che cosa È questa utenza, in una riga sola —
// il ruolo per le persone, «Custom - nome» per i ruoli su misura, e per i
// dispositivi la natura (Monitor / Stampante) col modello.
function staffDescrizioneUtenza(s) {
  if (s.ruolo === 'dispositivo') {
    return 'Dispositivo - ' + (s.deviceKind === 'stampante' ? 'Stampante' : 'Monitor') + ': ' + s.modello;
  }
  if (s.ruolo === 'personalizzato') return 'Custom - ' + (s.customNome || 'Ruolo personalizzato');
  return (RUOLI_STAFF.find(r => r.id === s.ruolo) || {}).label || s.ruolo;
}

// `pieno`: stessa scheda ma a pagina intera, senza velo né finestra centrata
// — riempie il posto che la rotta Contatti le dà, e a chiudere ci pensa la
// barra «torna» del chiamante.
//
// La scheda vive in DUE tab, come le sorelle (locale e utente app):
// Anagrafica — chi è la persona (nome, email, luogo, editabili), su
// quali locali vale la sua utenza, i dettagli dell'utenza — e Statistiche,
// che esiste SOLO per chi ha un'utenza cameriere: mesi di lavoro, scontrino
// medio e mancia media sono cose da sala, una cassa non le ha.
function StaffDrawer({ staff: s, onClose, pieno }) {
  const device = s.ruolo === 'dispositivo';
  const [tab, setTab] = useStateCam('anagrafica');

  // ── Form anagrafica: editabile con salvataggio, come la scheda utente ──
  const formDa = (x) => ({ nome: x.nome, email: x.email || '', luogo: x.luogo || '' });
  const [form, setForm] = useStateCam(formDa(s));
  const [saved, setSaved] = useStateCam(false);
  React.useEffect(() => { setTab('anagrafica'); setForm(formDa(s)); setSaved(false); }, [s.id]);
  const base = formDa(s);
  const dirty = form.nome !== base.nome || form.email !== base.email || form.luogo !== base.luogo;
  const salva = () => {
    Object.assign(s, { nome: form.nome, email: form.email || null, luogo: form.luogo || null });
    setSaved(true); setTimeout(() => setSaved(false), 2200);
  };
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target ? e.target.value : e })); };

  const inputStyle = {
    width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8,
    fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};

  // Le utenze nate prima del multi-locale hanno solo i campi del principale.
  const locali = s.locali || [{ id: s.localeId, nome: s.localeNome, citta: s.localeCitta }];

  // Il log dell'utenza: come nelle schede utente app e locale — niente
  // icone, chiave tecnica in chiaro, dal più recente (ancorato all'ultima
  // attività VERA). I dispositivi loggano anche loro: ping e stampe.
  const eventiStaff = (() => {
    const ss = hubSeme('log-' + s.id) % 1000;
    const r = (n) => ((ss * (n + 1) * 9301 + 49297) % 233280) / 233280;
    const out = [];
    let t = s.lastActive.getTime();
    const n = 8 + Math.floor(r(1) * 6);
    for (let i = 0; i < n; i++) {
      const rr = r(10 + i * 3);
      let tipo, dett;
      if (device) {
        tipo = s.deviceKind === 'stampante' ? (rr < 0.75 ? 'print_job' : 'device_online') : 'device_online';
        dett = tipo === 'print_job' ? `Scontrino #${3200 + Math.floor(rr * 400)}` : `${s.modello} · ping ok`;
      } else {
        const pool = s.ruolo === 'cameriere'
          ? ['order_taken', 'order_taken', 'payment_collected', 'staff_login', 'shift_closed']
          : s.ruolo === 'cassa'
            ? ['payment_collected', 'payment_collected', 'staff_login', 'shift_closed']
            : ['staff_login', 'staff_login', 'shift_closed'];
        tipo = pool[Math.floor(rr * (pool.length - 0.001))];
        dett = {
          order_taken: `Tavolo ${1 + Math.floor(rr * 14)} · € ${(9 + rr * 46).toFixed(2).replace('.', ',')}`,
          payment_collected: `€ ${(12 + rr * 80).toFixed(2).replace('.', ',')} · ${rr < 0.5 ? 'carta' : 'contanti'}`,
          staff_login: s.localeNome,
          shift_closed: `${4 + Math.floor(rr * 5)} h di turno`,
        }[tipo];
      }
      out.push({ id: s.id + '-E' + i, tipo, quando: new Date(t), dettaglio: dett });
      t -= (3 + Math.floor(r(11 + i * 3) * 30)) * 3600000;
    }
    return out;
  })();
  const [logDal, setLogDal] = useStateCam('');
  const [logAl, setLogAl] = useStateCam('');
  React.useEffect(() => { setLogDal(''); setLogAl(''); }, [s.id]);
  const eventiFiltrati = eventiStaff.filter(e =>
    (!logDal || e.quando >= new Date(logDal)) &&
    (!logAl || e.quando < new Date(new Date(logAl).getTime() + 86400000)));

  const tabs = [{ id: 'anagrafica', label: 'Anagrafica' }];
  if (s.ruolo === 'cameriere') tabs.push({ id: 'statistiche', label: 'Statistiche' });
  // Anche l'utenza staff esprime consensi: la tab c'è per le PERSONE, un
  // dispositivo non ha niente da consentire.
  if (!device) tabs.push({ id: 'consensi', label: 'Consensi' });
  tabs.push({ id: 'log', label: `Log (${eventiStaff.length})` });
  const mesiLavoro = Math.max(1, Math.floor((Date.now() - s.dataAssunzione) / (30.44 * 86400000)));

  // I consensi della persona, stabili sul seme dell'utenza: lo stato per
  // codice e i documenti contro cui vale — la stessa veste delle schede
  // locale e utente app (DrwConsensiPannello).
  const consensiStaff = (() => {
    const ss = hubSeme('cns-' + s.id);
    const giorno = (k, max) => new Date(Math.min(Date.now() - 86400000,
      s.dataAssunzione.getTime() + ((ss >> k) % max) * 86400000));
    return [
      { id: 'A6', label: 'Marketing',
        desc: 'Comunicazioni promozionali di byup alla persona',
        deciso: ss % 6 !== 0, ok: ss % 6 !== 0 && ss % 3 !== 0, quando: giorno(2, 90), versione: '1.0' },
      { id: 'S1', label: 'Comunicazioni di prodotto e formazione',
        desc: 'Novità del gestionale e materiale formativo per l\'utenza staff',
        deciso: true, ok: ss % 4 !== 0, quando: giorno(4, 60), versione: '1.0' },
    ];
  })();
  const documentiStaff = [
    { nome: 'Informativa privacy utenze staff', versione: '1.0',
      nota: 'Presa visione alla creazione dell\'utenza · è la versione scritta accanto a ogni consenso',
      quando: s.dataAssunzione, rif: consensiStaff.filter(c => c.deciso).map(c => c.id).join(', ') || '—' },
  ];

  return (
    <div onClick={pieno ? undefined : onClose} style={pieno ? {} : {
      position:'fixed', inset:0, zIndex:50,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
    }}>
      <div onClick={e=>e.stopPropagation()} style={pieno ? {
        width:'100%', background:'#fff',
        display:'flex', flexDirection:'column',
      } : {
        width:760, maxWidth:'94%', background:'#fff', maxHeight:'88%',
        borderRadius:18, overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.22s cubic-bezier(0.22,0.9,0.35,1)',
      }}>
        <div style={{padding:'20px 24px 14px', display:'flex', alignItems:'center', gap:14}}>
          {device
            ? <div style={{width:48, height:48, borderRadius:10, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.monitor size={27}/></div>
            : <AdmAvatar name={form.nome} size={53} bg={`hsl(${(s.id.charCodeAt(2)+s.id.charCodeAt(3))*7 % 360}, 45%, 55%)`}/>}
          {/* SOLO il nome: ruolo, id, locali e modello sono anagrafe e
              vivono nelle tab qui sotto — la testata presenta, non
              riassume. */}
          <div style={{
            flex:1, minWidth:0,
            fontSize:19, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            fontFamily: device ? 'ui-monospace,monospace' : 'inherit',
          }}>{device ? s.nome : form.nome}</div>
          {!pieno && <AdmIconBtn icon="x" onClick={onClose}/>}
        </div>

        <AdmTabBar tabs={tabs} active={tab} onChange={setTab}/>

        {/* ═══ TAB ANAGRAFICA ═══ */}
        {tab === 'anagrafica' && (
        <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
          {/* I dati della PERSONA, editabili: un dispositivo non ne ha. */}
          {!device && (
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Dati anagrafici</div>
                {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
                <div style={{gridColumn:'1 / -1'}}>
                  <label style={labelStyle}>Nome e cognome</label>
                  <input value={form.nome} onChange={F('nome')} style={inputStyle}/>
                </div>
                <div style={{gridColumn:'1 / -1'}}>
                  <label style={labelStyle}>Email</label>
                  <input value={form.email} onChange={F('email')} placeholder="Nessuna email" style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                {/* Niente data di nascita né genere (P-58 · RL-09): il
                    gestionale, dove le persone si invitano, chiede nome, email
                    e ruolo e nient'altro. La scheda non promette un dato che
                    non esiste da nessuna parte. */}
                <div style={{gridColumn:'1 / -1'}}>
                  <label style={labelStyle}>Luogo principale</label>
                  <input value={form.luogo} onChange={F('luogo')} placeholder="—" style={inputStyle}/>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={salva}>Salva modifiche</AdmButton>
              </div>
            </AdmCard>
          )}

          {/* I LOCALI dell'utenza: possono essere più d'uno, e la scheda lo
              dice per esteso — il primo è il principale, gli altri valgono
              con le stesse credenziali. Prima qui c'erano due righe («Locale»
              e «ID Locale») che sapevano raccontarne uno solo. */}
          <AdmCard padding={20}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Locali associati</div>
              <span style={{padding:'1px 8px', borderRadius:999, background:ADM.TEAL_SOFT, color:ADM.TEAL, fontSize:12.5, fontWeight:800}}>{locali.length}</span>
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, marginBottom:12}}>
              {device
                ? 'Un dispositivo appartiene al locale in cui è montato.'
                : 'Un’utenza staff può essere associata a più locali: le stesse credenziali valgono su tutti quelli elencati. Il primo è il principale.'}
            </div>
            {locali.map((l, i) => (
              <div key={l.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                borderBottom: i === locali.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
              }}>
                <div style={{width:34, height:34, borderRadius:8, background:ADM.PINK_SOFT, color:ADM.PINK, display:'grid', placeItems:'center', flexShrink:0}}>
                  <BuIcons.store size={20}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, display:'flex', alignItems:'center', gap:7}}>
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</span>
                    {i === 0 && locali.length > 1 && (
                      <span style={{padding:'1px 7px', borderRadius:4, background:ADM.PINK_BG_SOFT, color:ADM.PINK_DARK, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0}}>Principale</span>
                    )}
                  </div>
                  <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{l.citta}</div>
                </div>
                <span style={{fontFamily:'ui-monospace,monospace', fontSize:12.6, color:ADM.MUTED}}>{l.id}</span>
              </div>
            ))}
          </AdmCard>

          {/* Aree del gestionale coperte — solo per i ruoli personalizzati */}
          {s.ruolo === 'personalizzato' && s.aree && (
            <AdmCard padding={20}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Aree del gestionale</div>
              <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>Questo ruolo personalizzato ha accesso a {s.aree.length} aree su {AREE_GESTIONALE.length}</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {AREE_GESTIONALE.map(area => {
                  const on = s.aree.includes(area);
                  return (
                    <span key={area} style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      padding:'6px 11px', borderRadius:8,
                      background: on ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT,
                      color: on ? ADM.OK : ADM.MUTED_SOFT,
                      fontSize:13, fontWeight:600,
                      border:`1px solid ${on ? ADM.OK + '33' : 'transparent'}`,
                    }}>
                      <BuIcons.check size={17} color={on ? ADM.OK : ADM.MUTED_LIGHT}/>
                      {area}
                    </span>
                  );
                })}
              </div>
            </AdmCard>
          )}

          <AdmCard padding={20}>
            <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>{device ? 'Dettagli dispositivo' : 'Dettagli utenza'}</div>
            {/* Al posto del generico «Tipo»: che cosa è questa utenza, per
                esteso — ruolo, nome del ruolo custom, o natura e modello del
                dispositivo. */}
            <DataRow label="Descrizione utenza" value={staffDescrizioneUtenza(s)}/>
            <DataRow label="ID utenza" value={s.id} mono/>
            {device && <DataRow label="Codice" value={s.nome} mono/>}
            <DataRow label={device ? 'Registrato il' : 'Assunto il'} value={fmtDate(s.dataAssunzione)}/>
            <DataRow label="Ultima attività" value={fmtRelative(s.lastActive)}/>
            {/* Binario, come per gli altri contatti: o l'utenza è viva o non
                lo è — «attivo oggi» lo racconta già «Ultima attività». */}
            <DataRow label="Stato" value={(Date.now() - s.lastActive) <= 7 * 86400000 ? 'Attivo' : 'Inattivo'} last/>
          </AdmCard>
        </div>
        )}

        {/* ═══ TAB STATISTICHE — solo utenze cameriere ═══ */}
        {tab === 'statistiche' && (
        <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
          {/* Le tre cifre della persona in sala: da quanto lavora, quanto
              vale un suo ordine, quanto le lasciano. Al centesimo — uno
              scontrino medio «€ 23» non è uno scontrino medio. */}
          <AdmCard padding={0}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
              <MiniStat first label="Mesi di lavoro" value={fmtNum(mesiLavoro)} sub={'Dal ' + fmtDate(s.dataAssunzione)}/>
              {/* Il metro: la mediana dei CAMERIERI accanto al numero —
                  drwVsMediana è lo stesso helper della scheda locale. */}
              <MiniStat label="Scontrino medio" value={camEur2(s.scontrinoMedio)}
                sub={<React.Fragment>Per ordine preso{drwVsMediana(s.scontrinoMedio, CAM_MEDIANE.scontrino, camEur2)}</React.Fragment>}/>
              <MiniStat label="Mancia media" value={camEur2(s.manciaMedia)}
                sub={<React.Fragment>Per conto chiuso{drwVsMediana(s.manciaMedia, CAM_MEDIANE.mancia, camEur2)}</React.Fragment>}/>
            </div>
          </AdmCard>

          {/* L'operatività del mese, che prima stava sparsa in cima alla
              scheda: qui, sotto le cifre di sala. */}
          <AdmCard padding={0}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
              <MiniStat first label="Ordini mese" value={fmtNum(s.ordiniMese)}
                sub={<React.Fragment>Presi al tavolo{drwVsMediana(s.ordiniMese, CAM_MEDIANE.ordini, fmtNum)}</React.Fragment>}/>
              <MiniStat label="Coperti gestiti" value={fmtNum(s.coperti)}
                sub={<React.Fragment>Mese corrente{drwVsMediana(s.coperti, CAM_MEDIANE.coperti, fmtNum)}</React.Fragment>}/>
            </div>
          </AdmCard>
        </div>
        )}

        {/* ═══ TAB CONSENSI — la stessa veste delle altre schede ═══ */}
        {tab === 'consensi' && (
        <div style={{flex:1, overflow:'auto', background:ADM.PANEL_SOFT}}>
          <DrwConsensiPannello righe={consensiStaff} documenti={documentiStaff}
            nota="Le comunicazioni operative dell'utenza (turni, avvisi del locale, sicurezza) viaggiano senza consenso: sono necessarie al servizio."/>
        </div>
        )}

        {/* ═══ TAB LOG — la stessa veste delle schede utente app e locale ═══ */}
        {tab === 'log' && (
        <div style={{flex:1, overflow:'auto', padding:'20px 24px', background:ADM.PANEL_SOFT}}>
          <AdmCard padding={0}>
            <div style={{padding:'14px 20px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Eventi tracciati</div>
              <div style={{fontSize:13, color:ADM.MUTED}}>
                {(logDal || logAl) ? `${eventiFiltrati.length} di ${eventiStaff.length}` : `${eventiStaff.length} eventi dal ${fmtDate(eventiStaff[eventiStaff.length - 1].quando)}`}
              </div>
              <div style={{flex:1}}/>
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
            {eventiFiltrati.length === 0 && (
              <div style={{padding:'26px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>Nessun evento tra le date scelte.</div>
            )}
            {eventiFiltrati.map((e, i) => (
              <div key={e.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'11px 20px',
                borderBottom: i === eventiFiltrati.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                background: i % 2 === 1 ? ADM.ROW_STRIPE : 'transparent',
              }}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{CAM_EVENTI[e.tipo] || e.tipo}</div>
                  <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.dettaglio}</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT}}>{e.tipo}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2}}>{fmtDateTime(e.quando)}</div>
                </div>
              </div>
            ))}
          </AdmCard>
        </div>
        )}
      </div>
    </div>
  );
}

// fmtEur taglia i decimali, e sulle cifre da sala i decimali sono la cifra:
// scontrino e mancia si leggono al centesimo.
const camEur2 = (n) => n == null ? '—'
  : '€ ' + new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// Le mediane dei CAMERIERI: il metro accanto alle cifre da sala — sui campi
// veri del mock, non su formule doppie.
const CAM_MEDIANE = (() => {
  const med = (a) => {
    const v = a.filter(x => x != null).sort((x, y) => x - y);
    if (!v.length) return null;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  };
  const cam = STAFF.filter(x => x.ruolo === 'cameriere');
  return {
    scontrino: med(cam.map(x => x.scontrinoMedio)),
    mancia: med(cam.map(x => x.manciaMedia)),
    ordini: med(cam.map(x => x.ordiniMese)),
    coperti: med(cam.map(x => x.coperti)),
  };
})();

// Il vocabolario del log staff: gli eventi dell'app Staff e dei dispositivi.
const CAM_EVENTI = {
  staff_login:       'Accesso utenza',
  order_taken:       'Ordine preso al tavolo',
  payment_collected: 'Conto incassato',
  shift_closed:      'Turno chiuso',
  print_job:         'Stampa scontrino',
  device_online:     'Dispositivo online',
};

