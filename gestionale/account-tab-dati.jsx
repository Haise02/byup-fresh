// Account — Tab Dati generali

// I locali gestiti da questo account. L'attivo è condiviso via
// window.byupReadLocale/byupWriteLocale (definiti in panoramica-sidebar.jsx).
const ACC_LOCALI = [
  { id: 'cp', name: 'Cacio e Pepe', city: 'Roma · Trastevere', addr: 'Via dei Giubbonari 27', role: 'Owner', logo: 'CP' },
  { id: 'co', name: 'Cacio e Pepe · Ostiense', city: 'Roma · Ostiense', addr: 'Via Ostiense 142', role: 'Owner', logo: 'CO' },
  { id: 'tb', name: 'Trattoria del Borgo', city: 'Frascati · RM', addr: 'Piazza San Pietro 4', role: 'Manager', logo: 'TB' },
];

// Locali già su byup ma non ancora collegati a questo account — usati dalla
// ricerca "Collega un locale esistente".
const ACC_DIRECTORY = [
  { id: 'op', name: 'Osteria del Ponte',   addr: 'Via del Moro 12',        city: 'Roma · Trastevere' },
  { id: 'll', name: 'La Lanterna',         addr: 'Corso Duca di Genova 88', city: 'Ostia · RM' },
  { id: 'pg', name: 'Pizzeria da Gigi',    addr: 'Via Tuscolana 340',       city: 'Frascati · RM' },
  { id: 'bm', name: 'Bar Mediterraneo',    addr: 'Piazza Navona 4',         city: 'Roma · Centro' },
];

function AccDatiGenerali() {
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  // Logout — azione della card Profilo personale, con conferma.
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  // Foto profilo: url (null = iniziali), posizione dell'inquadratura in %, popup.
  const [fotoOpen, setFotoOpen] = React.useState(false);
  const [foto, setFoto] = React.useState(null);            // { url, pos:{x,y} } | null
  const [fotoHover, setFotoHover] = React.useState(false);
  // Preferenze locali — modificabili.
  const [lingua, setLingua] = React.useState('Italiano');
  const [fuso, setFuso] = React.useState('Europe/Rome (UTC+1)');
  const [valuta, setValuta] = React.useState('EUR (€)');
  // Dati personali modificabili: draft (a video) vs salvati; le modifiche
  // vanno confermate con "Salva modifiche" o scartate con "Annulla".
  const [datiSalvati, setDatiSalvati] = React.useState({
    nome: ACC_DATI.nome, cognome: ACC_DATI.cognome,
    email: ACC_DATI.email, telefono: ACC_DATI.telefono,
  });
  const [datiDraft, setDatiDraft] = React.useState(datiSalvati);
  const [datiToast, setDatiToast] = React.useState(null);
  const datiDirty = JSON.stringify(datiDraft) !== JSON.stringify(datiSalvati);
  const setCampo = (k) => (v) => setDatiDraft(d => ({ ...d, [k]: v }));
  // Caso 1 di P-62 (contact_data): nasce dal salvataggio dei recapiti e non
  // si nomina mai a schermo — i campi sono la porta. Nel modello è una riga
  // restaurant_holder_changes che passa da proposed a verified a completed,
  // senza catena fiscale: qui resta locale alla card, perché il registro
  // condiviso serve ai casi con catena.
  // P-117 (D-104): il recapito nuovo si verifica PRIMA di sostituire il
  // vecchio, e il vecchio riceve l'avviso del cambio — è la sola difesa che
  // esiste se qualcuno entra nell'account. Vale per l'email e per il telefono.
  // Ogni modifica — recapiti e nome — scrive un evento nel registro delle
  // attività con il valore precedente e quello nuovo (audit_events): non è un
  // cambio di titolarità, è un fatto dell'account, e si registra come tale.
  const [emailVerifica, setEmailVerifica] = React.useState(null); // { campo, valore, stato }
  const salvaDati = () => {
    const nuovaMail = datiDraft.email !== datiSalvati.email;
    const nuovoTel = datiDraft.telefono !== datiSalvati.telefono;
    const nuovoNome = datiDraft.nome !== datiSalvati.nome || datiDraft.cognome !== datiSalvati.cognome;
    const scrivi = (tipo, da, a) => { if (window.byupScriviAuditEvento) window.byupScriviAuditEvento(tipo, da, a); };
    // Il nome si sostituisce subito: non è un recapito, non c'è nulla da
    // verificare. Resta l'evento, col valore di prima.
    if (nuovoNome) scrivi('name_changed', `${datiSalvati.nome} ${datiSalvati.cognome}`.trim(), `${datiDraft.nome} ${datiDraft.cognome}`.trim());
    // I recapiti nuovi restano in sospeso finché non si aprono i link.
    const daVerificare = nuovaMail ? { campo: 'email', valore: datiDraft.email, precedente: datiSalvati.email }
      : nuovoTel ? { campo: 'telefono', valore: datiDraft.telefono, precedente: datiSalvati.telefono } : null;
    setDatiSalvati(d => ({ ...datiDraft, email: nuovaMail ? d.email : datiDraft.email, telefono: nuovoTel ? d.telefono : datiDraft.telefono }));
    if (daVerificare) {
      setEmailVerifica({ ...daVerificare, stato: 'da_verificare' });
      setDatiToast(daVerificare.campo === 'email'
        ? `✓ Ti abbiamo scritto a ${daVerificare.valore}: conferma la nuova casella`
        : `✓ Ti abbiamo mandato un codice al ${daVerificare.valore}: confermalo`);
    } else {
      setDatiToast('✓ Dati profilo aggiornati');
    }
    setTimeout(() => setDatiToast(null), 2800);
  };
  // La conferma: il recapito nuovo sostituisce il vecchio, il vecchio riceve
  // l'avviso, e l'evento entra nel registro.
  const confermaRecapito = () => {
    const v = emailVerifica; if (!v) return;
    setDatiSalvati(d => ({ ...d, [v.campo]: v.valore }));
    setDatiDraft(d => ({ ...d, [v.campo]: v.valore }));
    if (window.byupScriviAuditEvento) window.byupScriviAuditEvento(v.campo === 'email' ? 'email_changed' : 'phone_changed', v.precedente, v.valore);
    setEmailVerifica({ ...v, stato: 'verificata' });
    setDatiToast(v.campo === 'email' ? '✓ Nuova casella verificata' : '✓ Nuovo numero verificato');
    setTimeout(() => setDatiToast(null), 2400);
  };
  // Locale attivo + cambio contesto: breve transizione, persistenza condivisa
  // (sidebar inclusa), poi si apre la Panoramica del locale scelto.
  const [localeAttivo, setLocaleAttivo] = React.useState(() =>
    (window.byupReadLocale && window.byupReadLocale()) || { id: 'cp', nome: 'Cacio e Pepe' });
  const [switching, setSwitching] = React.useState(null); // id del locale in passaggio
  // Lista locali (con eventuali richieste in attesa) + popup aggiunta/dissociazione
  const [locali, setLocali] = React.useState(ACC_LOCALI);
  const [addOpen, setAddOpen] = React.useState(false);
  const [dissocia, setDissocia] = React.useState(null); // locale da dissociare
  const inviaRichiesta = (dir) => {
    setLocali(prev => [...prev, {
      id: dir.id, name: dir.name, city: dir.city, addr: dir.addr,
      role: 'Manager', pending: true,
      cover: 'linear-gradient(135deg, #64748B, #94A3B8)',
      logo: dir.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    }]);
    setAddOpen(false);
    // L'esito detto subito (P-72 · D-57): la via del collegamento produce un
    // collaboratore, mai un titolare — account_link_requests: nessuna
    // approvazione per questa via attribuisce il ruolo di titolare.
    setDatiToast(`✓ Richiesta inviata a ${dir.name}: se il titolare approva entri come collaboratore, non come titolare`);
    setTimeout(() => setDatiToast(null), 3200);
  };
  // La sede della catena: nasce già completa per tutto ciò che è del
  // soggetto, diventa il locale attivo e si va dritti alla configurazione
  // completa, dove resta da impostare la sala.
  const creaSede = (sede) => {
    const id = 'sede-' + Date.now().toString(36).slice(-4);
    const nome = sede.insegna.trim().replace(/\s*·\s*$/, '');
    setLocali(prev => [...prev, {
      id, name: nome, city: `${sede.citta.trim()}${sede.prov.trim() ? ' · ' + sede.prov.trim() : ''}`, addr: sede.indirizzo.trim(),
      role: 'Owner', catena: true,
      logo: nome.split(/[\s·]+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    }]);
    setAddOpen(false);
    if (window.byupWriteLocale) byupWriteLocale({ id, nome });
    // Prima le sale e i tavoli (il passo 3 dell'onboarding, da solo), poi la
    // Configurazione completa.
    window.location.href = `byup Restaurant Onboarding.html?sede=catena&nome=${encodeURIComponent(nome)}`;
  };
  const confermaDissocia = () => {
    const loc = dissocia;
    setLocali(prev => prev.filter(l => l.id !== loc.id));
    setDissocia(null);
    setDatiToast(loc.pending ? `✓ Richiesta a ${loc.name} annullata` : `✓ ${loc.name} dissociato dal tuo account`);
    setTimeout(() => setDatiToast(null), 2800);
  };
  const apriGestionale = (loc) => {
    if (switching || loc.id === localeAttivo.id) return;
    setSwitching(loc.id);
    setTimeout(() => {
      const nuovo = { id: loc.id, nome: loc.name };
      if (window.byupWriteLocale) window.byupWriteLocale(nuovo);
      setLocaleAttivo(nuovo);
      setSwitching(null);
      setDatiToast(`✓ Ora stai gestendo ${loc.name} . Apro la Panoramica…`);
      setTimeout(() => { window.location.href = 'byup Panoramica.html'; }, 1200);
    }, 900);
  };
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <AcCard title="Profilo personale" subtitle="Le informazioni del tuo account." action={
        <button
          onClick={() => setLogoutConfirm(true)}
          title="Termina la sessione su questo dispositivo"
          style={{
            display:'inline-flex', alignItems:'center', gap: 7,
            padding:'8px 14px', borderRadius: 999,
            background: PN.WHITE, color: PN.MUTED,
            border:`1px solid ${PN.BORDER}`,
            fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            transition:'color 150ms, border-color 150ms, background 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = PN.TEXT; e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#F9FAFB'; }}
          onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.background = PN.WHITE; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Esci dall'account
        </button>
      }>
        <div style={{display:'flex', alignItems:'center', gap: 18, marginBottom: 22}}>
          {/* Avatar cliccabile — apre il popup di gestione foto */}
          <button
            onClick={() => setFotoOpen(true)}
            onMouseEnter={() => setFotoHover(true)}
            onMouseLeave={() => setFotoHover(false)}
            title="Gestisci la foto profilo"
            style={{
              width: 72, height: 72, borderRadius:'50%', flexShrink: 0,
              padding: 0, border: 'none', cursor: 'pointer',
              position:'relative', overflow:'hidden',
              background: foto ? PN.WHITE : `linear-gradient(135deg, ${PN.PINK_DARK}, #B91C5C)`,
              color: PN.WHITE, display:'grid', placeItems:'center',
              fontSize: 28, fontWeight: 800, fontFamily:'inherit',
            }}>
            {foto ? (
              <img src={foto.url} alt="Foto profilo" style={{
                position:'absolute', inset: 0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:`${foto.pos.x}% ${foto.pos.y}%`,
              }}/>
            ) : 'MR'}
            {/* overlay hover: segnala che la foto è cliccabile */}
            <span style={{
              position:'absolute', inset: 0, borderRadius:'50%',
              background:'rgba(15,17,21,0.45)',
              display:'grid', placeItems:'center',
              opacity: fotoHover ? 1 : 0, transition:'opacity 150ms',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>
            </span>
          </button>
          <div>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT}}>{datiSalvati.nome} {datiSalvati.cognome}</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2}}>{ACC_DATI.ruolo} · {localeAttivo.nome}</div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
          <AcEditField label="Nome" value={datiDraft.nome} onChange={setCampo('nome')}/>
          <AcEditField label="Cognome" value={datiDraft.cognome} onChange={setCampo('cognome')}/>
          <AcEditField label="Email" type="email" value={datiDraft.email} onChange={setCampo('email')}/>
          <AcEditField label="Telefono" type="tel" value={datiDraft.telefono} onChange={setCampo('telefono')}/>
        </div>
        {emailVerifica && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: emailVerifica.stato === 'verificata' ? PN.GREEN_SOFT : PN.AMBER_SOFT,
            display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap',
            fontSize: 14, color: PN.TEXT,
          }}>
            <span style={{flex: 1, minWidth: 200}}>
              {emailVerifica.stato === 'verificata'
                ? <><b style={{color: PN.GREEN}}>{emailVerifica.campo === 'email' ? 'Casella verificata.' : 'Numero verificato.'}</b> {emailVerifica.valore} è {emailVerifica.campo === 'email' ? 'la tua nuova email' : 'il tuo nuovo numero'}. Abbiamo avvisato del cambio anche {emailVerifica.precedente}, e il cambiamento è nel registro delle attività.</>
                : <><b style={{color: PN.AMBER}}>Da verificare.</b> {emailVerifica.campo === 'email' ? <>Abbiamo scritto a {emailVerifica.valore}: la casella cambia quando apri il link, e fino ad allora resta {emailVerifica.precedente}.</> : <>Abbiamo mandato un codice al {emailVerifica.valore}: il numero cambia quando lo confermi, e fino ad allora resta {emailVerifica.precedente}.</>}</>}
            </span>
            {emailVerifica.stato !== 'verificata' && (
              <button onClick={confermaRecapito}
                title="Nel prodotto è il link nella mail o il codice via SMS: qui si simula" style={{
                padding:'7px 12px', borderRadius: 999, border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
                fontSize: 13.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit', color: PN.TEXT,
              }}>{emailVerifica.campo === 'email' ? 'Ho aperto il link (demo)' : 'Ho inserito il codice (demo)'}</button>
            )}
          </div>
        )}

        {/* P-117 (D-104): chi è il soggetto fiscale del locale, in sola
            lettura, e il rimando a dove lo si cambia. In questa pagina si
            cambiano i propri dati e nient'altro: il «passa la titolarità» non
            esiste più, perché nel prodotto non esiste. */}
        <AcSoggettoFiscale/>

        {/* Barra conferma — compare solo con modifiche in sospeso */}
        {datiDirty && (
          <div style={{
            display:'flex', alignItems:'center', gap: 10,
            marginTop: 16, padding: '10px 14px',
            background: PN.PINK_SOFT, border: `1px dashed ${PN.PINK}`,
            borderRadius: 10,
          }}>
            <span style={{flex: 1, fontSize: 14.5, fontWeight: 600, color: PN.PINK_DARK}}>
              Hai modifiche non salvate.
            </span>
            <button
              onClick={() => setDatiDraft(datiSalvati)}
              style={{
                padding:'8px 14px', borderRadius: 999,
                background: PN.WHITE, color: PN.TEXT,
                border:`1px solid ${PN.BORDER}`,
                fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>
              Annulla
            </button>
            <button
              onClick={salvaDati}
              style={{
                padding:'8px 16px', borderRadius: 999,
                background: PN.BTN_DARK, color: PN.WHITE,
                border: '1px solid rgba(0,0,0,0.32)',
                fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>
              Salva modifiche
            </button>
          </div>
        )}

        {datiToast && (
          <div style={{
            position:'absolute', bottom: 28, left:'50%', transform:'translateX(-50%)',
            background:'#0F1115', color:'#fff',
            padding:'12px 22px', borderRadius: 999,
            fontSize: 15.5, fontWeight: 700, zIndex: 120,
            whiteSpace:'nowrap',
            boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
          }}>{datiToast}</div>
        )}
      </AcCard>

      <AcCard title="I tuoi locali" subtitle="Locali gestiti da questo account · clicca su un locale per passare al suo gestionale.">
        <div style={{display:'grid', gridTemplateColumns: STG('repeat(4, 1fr)', '1fr 1fr'), gap: 12}}>
          {switching && <style>{`@keyframes acSpin { to { transform: rotate(360deg); } }`}</style>}
          {locali.map((loc) => {
            const active = loc.id === localeAttivo.id;
            const opening = switching === loc.id;
            return (
            <div key={loc.id}
              onClick={() => { if (!loc.pending) apriGestionale(loc); }}
              style={{
                position:'relative',
                borderRadius: 12,
                border: active ? `2px solid ${PN.PINK}` : `1px solid ${PN.BORDER_HAIR}`,
                background: PN.WHITE,
                boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)',
                padding: '16px 14px 14px',
                display:'flex', flexDirection:'column',
                cursor: active || loc.pending ? 'default' : 'pointer',
                transition:'box-shadow .15s, transform .15s, opacity .15s',
                opacity: loc.pending ? 0.9 : (switching && !opening && !active ? 0.6 : 1),
              }}
              onMouseEnter={e => { if (!active && !switching && !loc.pending) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,17,21,0.09)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(15,17,21,0.04), 0 4px 12px rgba(15,17,21,0.03)'; }}
            >
              {/* Badge sul bordo superiore — stesso pattern di ATTUALE nelle card piano */}
              {active && (
                <span style={{
                  position:'absolute', top: -9, left:'50%', transform:'translateX(-50%)',
                  fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5,
                  background: PN.PINK, color: PN.WHITE,
                  padding:'3px 10px', borderRadius: 999, whiteSpace:'nowrap',
                }}>IN USO</span>
              )}
              {loc.pending && (
                <span style={{
                  position:'absolute', top: -9, left:'50%', transform:'translateX(-50%)',
                  fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5,
                  background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A',
                  padding:'2px 10px', borderRadius: 999, whiteSpace:'nowrap',
                }}>IN ATTESA</span>
              )}

              {/* Logo + nome + ruolo */}
              <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 6}}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background:'linear-gradient(135deg, #FF5A5F, #E04347)',
                  display:'grid', placeItems:'center',
                  color:'#fff', fontSize: 11.5, fontWeight: 800,
                }}>{loc.logo}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{loc.name}</div>
                  {/* Nel dato resta Manager (mai Owner per questa via); a schermo
                      dice cosa sei: un collaboratore. */}
                  <div style={{fontSize: 11.5, fontWeight: 700, color: loc.role === 'Owner' ? PN.PINK_DARK : PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase'}}>{loc.role === 'Manager' ? 'Collaboratore' : loc.role}</div>
                </div>
              </div>

              <div style={{fontSize: 13, color: PN.MUTED, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{loc.city}</div>
              <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{loc.addr}</div>

              <div style={{flex: 1}}/>

              {loc.pending ? (
                <>
                  {/* L'esito, e la risposta alla domanda vera di chi ha perso
                      l'accesso e la cerca proprio qui: il titolare non si
                      sostituisce per questa via, il ripristino passa
                      dall'assistenza (P-73), con la chiamata come via
                      consigliata perché l'identità si verifica a voce sul
                      recapito censito. */}
                  <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 10, textAlign:'center', lineHeight: 1.4}}>
                    In attesa del titolare · entrerai come collaboratore
                  </div>
                  <div style={{fontSize: 12, color: PN.MUTED, marginTop: 6, textAlign:'center', lineHeight: 1.4}}>
                    Hai perso l'accesso al tuo locale? Non è questa la strada:{' '}
                    <a href="byup Supporto.html" onClick={e => e.stopPropagation()} style={{color: PN.PINK_DARK, fontWeight: 600}}>chiedi il ripristino all'assistenza</a>, meglio con una chiamata.
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDissocia(loc); }}
                    style={{
                      marginTop: 6, border:'none', background:'transparent', padding: 0,
                      fontSize: 12.5, fontWeight: 600, color: PN.MUTED,
                      cursor:'pointer', fontFamily:'inherit', textAlign:'center',
                      transition:'color 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = PN.TEXT}
                    onMouseLeave={e => e.currentTarget.style.color = PN.MUTED}
                  >Annulla richiesta</button>
                </>
              ) : (
                <>
                  {/* CTA a pillola — pattern delle card piano */}
                  <button
                    onClick={(e) => { e.stopPropagation(); apriGestionale(loc); }}
                    disabled={active || !!switching}
                    style={{
                      marginTop: 12, padding: '8px 12px', borderRadius: 999,
                      background: active ? PN.WHITE : PN.BTN_DARK,
                      color: active ? PN.MUTED : PN.WHITE,
                      border: active ? `1px solid ${PN.BORDER_LIGHT}` : '1px solid rgba(0,0,0,0.32)',
                      fontSize: 13, fontWeight: 700,
                      cursor: active ? 'default' : 'pointer', fontFamily:'inherit',
                      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
                      whiteSpace:'nowrap', overflow:'hidden',
                    }}>
                    {opening ? (
                      <>
                        <span style={{
                          width: 11, height: 11, borderRadius:'50%',
                          border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff',
                          animation:'acSpin 0.7s linear infinite', display:'inline-block',
                        }}/>
                        Passaggio…
                      </>
                    ) : active ? '✓ In uso' : 'Passa a questo locale'}
                  </button>
                  {/* Dissocia — link testuale discreto, come "Rimuovi" nel carrello */}
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!active) setDissocia(loc); }}
                    style={{
                      marginTop: 8, border:'none', background:'transparent', padding: 0,
                      fontSize: 12.5, fontWeight: 600,
                      color: PN.MUTED, opacity: active ? 0 : 1,
                      pointerEvents: active ? 'none' : 'auto',
                      cursor:'pointer', fontFamily:'inherit', textAlign:'center',
                      transition:'color 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = PN.TEXT}
                    onMouseLeave={e => e.currentTarget.style.color = PN.MUTED}
                  >Dissocia</button>
                </>
              )}
            </div>
            );
          })}
          {/* Add new — dashed card → popup: collega esistente o crea nuovo */}
          <button onClick={() => setAddOpen(true)} style={{
            border: `2px dashed ${PN.BORDER}`,
            borderRadius: 14, background: 'transparent',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap: 6, padding: 14, cursor:'pointer', fontFamily:'inherit',
            color: PN.MUTED,
            transition:'border-color 150ms, background 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = PN.TEXT; e.currentTarget.style.background = '#FAFBFC'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: PN.PINK_SOFT, color: PN.PINK,
              display:'grid', placeItems:'center',
            }}>
              <PnI.Plus size={17} color={PN.PINK}/>
            </div>
            <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, textAlign:'center'}}>Aggiungi un locale</div>
            <div style={{fontSize: 12.5, color: PN.MUTED, textAlign:'center', lineHeight: 1.4}}>
              Collegane uno esistente o creane uno nuovo.
            </div>
          </button>
        </div>
      </AcCard>

      <AcCard title="Lingua e regione" subtitle="Preferenze locali.">
        <div style={{display:'grid', gridTemplateColumns: STG('1fr 1fr 1fr'), gap: 14}}>
          <AcSelect label="Lingua" value={lingua} onChange={setLingua}
            options={['Italiano','English','Español','Français','Deutsch']}/>
          <AcSelect label="Fuso orario" value={fuso} onChange={setFuso}
            options={['Europe/Rome (UTC+1)','Europe/London (UTC+0)','Europe/Paris (UTC+1)','Europe/Madrid (UTC+1)','Europe/Berlin (UTC+1)','Europe/Athens (UTC+2)']}/>
          <AcSelect label="Valuta" value={valuta} onChange={setValuta}
            options={['EUR (€)','USD ($)','GBP (£)','CHF (Fr)']}/>
        </div>
      </AcCard>

      {fotoOpen && (
        <AcFotoModal
          foto={foto}
          onClose={() => setFotoOpen(false)}
          onSave={(next) => { setFoto(next); setFotoOpen(false); }}
        />
      )}

      {addOpen && (
        <AcAggiungiLocaleModal
          esistenti={locali.map(l => l.id)}
          onClose={() => setAddOpen(false)}
          onCollega={inviaRichiesta}
          onCatena={creaSede}
        />
      )}

      {/* Popup conferma logout */}
      {logoutConfirm && (
        <div onClick={() => setLogoutConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 380, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: PN.PINK_SOFT, color: PN.PINK_DARK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Esci dall'account?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  La sessione su questo dispositivo verrà terminata.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { window.location.href = 'byup Login.html'; }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: PN.BTN_DARK, color: PN.WHITE,
                  border: '1px solid rgba(0,0,0,0.32)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Esci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conferma dissociazione (o annullo richiesta) */}
      {dissocia && (
        <div onClick={() => setDissocia(null)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 400, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#FEF3C7', color: '#B45309',
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7"/><path d="M15 7h2a5 5 0 0 1 4 8"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>
                  {dissocia.pending ? 'Annullare la richiesta?' : `Dissociare ${dissocia.name}?`}
                </div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  {dissocia.pending
                    ? `La richiesta di collegamento a ${dissocia.name} verrà ritirata.`
                    : 'Il locale sarà rimosso dal tuo account e non potrai più accedere al suo gestionale. Il titolare potrà invitarti di nuovo.'}
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setDissocia(null)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={confermaDissocia}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: '#0F1115', color: '#fff',
                  border: '1px solid rgba(15,17,21,0.5)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                {dissocia.pending ? 'Annulla richiesta' : 'Dissocia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZONA PERICOLOSA — trattamento d'allarme: nastro a strisce, bordo e
          fondo rossi, CTA rossa piena. Deve leggersi a colpo d'occhio come
          "qui non si entra per sbaglio", diverso dal coral del brand. */}
      {/* Chiude l'account, non cede il locale: non esiste un passaggio del
          locale fra persone (D-104), e il ripristino assistito restituisce
          l'accesso alla stessa persona (D-57). */}
      <AcDangerZone
        titolo="Elimina account"
        testo="Tutti i dati del ristorante — menu, ordini, conti e statistiche — verranno cancellati definitivamente."
        nota="Chiude il tuo account: non cede il locale a nessuno, perché non esiste un passaggio del locale fra persone. Se a cambiare è il contribuente, il soggetto fiscale si cambia da Impostazioni → Dati fiscali."
        cta="Elimina account"
        onCta={() => setDeleteConfirm(true)}
      />

      {/* Popup conferma eliminazione — danger, ancorato al frame */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 400, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#FEE2E2', color: '#DC2626',
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Eliminare l'account?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  Tutti i dati del ristorante — menu, ordini, conti e statistiche — verranno cancellati <strong>definitivamente</strong>. Questa azione non può essere annullata.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { window.location.href = 'byup Login.html'; }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: '#DC2626', color: '#fff',
                  border: 'none',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                  boxShadow:'0 4px 12px -4px rgba(220,38,38,0.55)',
                  transition:'background 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#B91C1C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#DC2626'; }}>
                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AcDangerZone — il blocco delle azioni irreversibili.
// Rosso allarme #DC2626 (non il coral del brand): nastro a strisce diagonali
// da cantiere in testa, fondo e bordo rossi, icona di pericolo, CTA rossa
// piena. Esposto su window perché lo usano sia Dati generali (elimina account)
// sia Account e fatturazione (annulla abbonamento).
// ═══════════════════════════════════════════════════════════════════════════
function AcDangerZone({ titolo, testo, cta, onCta, nota }) {
  return (
    <div style={{
      borderRadius: 14, overflow:'hidden',
      border: '1.5px solid #FCA5A5',
      background: '#FFF5F5',
      boxShadow: '0 6px 20px -12px rgba(220, 38, 38, 0.45)',
    }}>
      {/* Nastro a strisce: segnale di cantiere, si legge prima delle parole */}
      <div style={{
        height: 8,
        backgroundImage: 'repeating-linear-gradient(135deg, #DC2626 0 12px, #FCA5A5 12px 24px)',
      }}/>

      <div style={{padding: 22}}>
        <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 14}}>
          <span style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background:'#DC2626', color:'#fff',
            display:'grid', placeItems:'center',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
          </span>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 800, color:'#DC2626',
              textTransform:'uppercase', letterSpacing:'0.10em', lineHeight: 1,
            }}>Zona pericolosa</div>
            <div style={{fontSize: 13.5, color:'#B91C1C', marginTop: 4, fontWeight: 600}}>
              Azioni irreversibili — nessuno può annullarle, nemmeno noi.
            </div>
          </div>
        </div>

        <div style={{
          display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
          padding: 16, borderRadius: 12,
          background:'#fff', border:'1px solid #FECACA',
        }}>
          <div style={{flex: 1, minWidth: 220}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color:'#7F1D1D'}}>{titolo}</div>
            <div style={{fontSize: 14.5, color:'#B91C1C', marginTop: 3, lineHeight: 1.5}}>{testo}</div>
            {nota && <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 6}}>{nota}</div>}
          </div>
          <button onClick={onCta} style={{
            padding:'11px 20px', borderRadius: 999, flexShrink: 0,
            background:'#DC2626', color:'#fff', border:'none',
            fontSize: 15, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            boxShadow:'0 4px 12px -4px rgba(220,38,38,0.55)',
            transition:'background 150ms ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B91C1C'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#DC2626'; }}
          >{cta}</button>
        </div>
      </div>
    </div>
  );
}

window.AcDangerZone = AcDangerZone;

function AcCard({ title, subtitle, children, danger, aurora, action }) {
  // L2 Aurora soft wash multi-color (pink + lavender + cream mesh).
  // Sistema 75/15/10.
  const auroraBg =
    'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
    'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
    'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
    'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)';
  return (
    <div style={{
      background: aurora ? auroraBg : PN.WHITE,
      borderRadius: 14,
      // Danger = ambra warning, non rosso: il rosso è il colore brand di Byup.
      border: `1px solid ${danger ? '#FDE68A' : aurora ? 'rgba(190, 175, 220, 0.14)' : PN.BORDER_SOFT}`,
      padding: 22,
    }}>
      <div style={{marginBottom: 18, display:'flex', alignItems:'flex-start', gap: 12}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 700, color: danger ? '#B45309' : PN.TEXT}}>{title}</div>
          {subtitle && <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3}}>{subtitle}</div>}
        </div>
        {action && <div style={{flexShrink: 0}}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function AcField({ label, value, full }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <div style={{
        padding:'10px 12px', borderRadius: 10,
        border:`1px solid ${PN.BORDER}`, background: '#FAFBFC',
        fontSize: 15.5, color: PN.TEXT, fontWeight: 500,
      }}>{value}</div>
    </div>
  );
}

const AcBtnGhost = {
  padding:'7px 14px', borderRadius: 999,
  background: PN.WHITE, color: PN.TEXT,
  border:`1px solid ${PN.BORDER}`,
  fontSize: 14, fontWeight: 600, cursor:'pointer',
  fontFamily:'inherit',
};

// Popup "Aggiungi un locale": collega un locale già su byup (ricerca per nome
// + richiesta al titolare), crea un nuovo locale (onboarding), oppure — la
// catena — aggiunge una SEDE dello stesso soggetto: stesso soggetto fiscale,
// stesso conto Stripe, stesso menù. Della sede nuova si dicono solo l'insegna
// e la sede operativa, poi si va dritti alla configurazione completa per la
// sala: il resto è già completo perché è del soggetto, non della sede.
function AcAggiungiLocaleModal({ esistenti, onClose, onCollega, onCatena }) {
  const [step, setStep] = React.useState('scelta'); // 'scelta' | 'cerca' | 'catena'
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [sede, setSede] = React.useState({ insegna: 'Cacio e Pepe · ', indirizzo: '', cap: '', citta: 'Roma', prov: 'RM' });
  const setS = (k) => (e) => setSede(x => ({ ...x, [k]: e.target.value }));
  const sedeOk = sede.insegna.trim().length > 2 && sede.indirizzo.trim() && sede.citta.trim();
  const inputStyle = {
    width:'100%', padding:'9px 11px', borderRadius: 10, boxSizing:'border-box',
    border:'1px solid rgba(15,17,21,0.14)', outline:'none', background:'rgba(255,255,255,0.85)',
    fontSize: 14.5, fontFamily:'inherit', color: PN.TEXT,
  };
  const lab = { fontSize: 12, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 4 };
  const risultati = ACC_DIRECTORY
    .filter(d => !esistenti.includes(d.id))
    .filter(d => !query.trim() || d.name.toLowerCase().includes(query.trim().toLowerCase()));

  const optionStyle = (hover) => ({
    display:'flex', alignItems:'flex-start', gap: 12, width:'100%',
    padding: '16px 16px', borderRadius: 14, textAlign:'left',
    background: hover ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
    border: '1px solid rgba(15,17,21,0.10)',
    cursor:'pointer', fontFamily:'inherit',
    transition:'background 150ms, border-color 150ms',
  });

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20, width: 440, maxWidth:'100%',
        padding: '22px 22px 20px',
        display:'flex', flexDirection:'column', gap: 16,
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10}}>
          <div>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>
              {step === 'scelta' ? 'Aggiungi un locale' : step === 'catena' ? 'Aggiungi una sede della catena' : 'Collega un locale esistente'}
            </div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
              {step === 'scelta'
                ? 'Il locale esiste già su byup, è una sede in più della tua catena, o parti da zero?'
                : step === 'catena'
                  ? `Stesso soggetto fiscale (${AC_TITOLARE.soggetto} · ${AC_TITOLARE.piva}), stesso conto Stripe, stesso menù. Della sede servono solo insegna e indirizzo; poi si imposta la sala.`
                  : 'Cerca il locale per nome e invia la richiesta al titolare.'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {step === 'scelta' ? (
          <div style={{display:'flex', flexDirection:'column', gap: 10}}>
            <button onClick={() => setStep('cerca')} style={optionStyle(false)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: PN.PINK_SOFT, color: PN.PINK_DARK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </span>
              <span style={{flex: 1}}>
                <span style={{display:'block', fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Collega un locale esistente</span>
                <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
                  Il locale è già su byup: cercalo per nome e invia una richiesta di collegamento al titolare. Il titolare riceve la richiesta e decide: se approva, entri come collaboratore con il ruolo che sceglie lui — non diventi titolare, e il titolare non si sostituisce per questa via.
                </span>
              </span>
            </button>
            <button onClick={() => setStep('catena')} style={optionStyle(false)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#EDE9FE', color: '#6D28D9',
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="7" height="12" rx="1.5"/><rect x="14" y="4" width="7" height="17" rx="1.5"/><path d="M6 13h1M6 16h1M17 8h1M17 12h1M17 16h1"/></svg>
              </span>
              <span style={{flex: 1}}>
                <span style={{display:'block', fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Catena: aggiungi una sede</span>
                <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
                  Un'altra sede dello stesso soggetto fiscale: eredita conto Stripe e menù. Serve solo la sede operativa, poi la sala.
                </span>
              </span>
            </button>
            <button onClick={() => { window.location.href = 'byup Restaurant Onboarding.html'; }} style={optionStyle(false)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.65)'}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#F4F5F7', color: PN.TEXT,
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>
              </span>
              <span style={{flex: 1}}>
                <span style={{display:'block', fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Crea un nuovo locale</span>
                <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
                  Configura da zero un nuovo punto vendita con la procedura guidata.
                </span>
              </span>
            </button>
          </div>
        ) : step === 'catena' ? (
          <>
            <div>
              <div style={lab}>Insegna della sede</div>
              <input autoFocus value={sede.insegna} onChange={setS('insegna')} placeholder="Es. Cacio e Pepe · Prati" style={inputStyle}/>
            </div>
            <div>
              <div style={lab}>Sede operativa</div>
              <input value={sede.indirizzo} onChange={setS('indirizzo')} placeholder="Via e numero civico" style={inputStyle}/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap: 8}}>
              <div><div style={lab}>CAP</div><input value={sede.cap} onChange={setS('cap')} style={inputStyle}/></div>
              <div><div style={lab}>Città</div><input value={sede.citta} onChange={setS('citta')} style={inputStyle}/></div>
              <div><div style={lab}>Prov.</div><input value={sede.prov} onChange={setS('prov')} style={inputStyle}/></div>
            </div>
            {/* Quello che la sede eredita, detto una volta: sono cose del
                soggetto, non della sede, e non si chiedono due volte. */}
            <div style={{padding:'10px 12px', borderRadius: 10, background: PN.GREEN_SOFT, fontSize: 13.5, color: PN.TEXT, lineHeight: 1.5}}>
              <b>Già completo, ereditato dalla catena:</b> soggetto fiscale e dati per fatturazione, conto Stripe (acct_••••dE3v), menù e listino, delega all'Agenzia. Da impostare per questa sede: la sala e i tavoli; il POS virtuale della sede va poi comunicato all'Agenzia.
            </div>
            <button
              disabled={!sedeOk}
              onClick={() => sedeOk && onCatena(sede)}
              style={{
                padding: '12px 18px', borderRadius: 999,
                background: sedeOk ? PN.BTN_DARK : PN.WHITE_FROST,
                color: sedeOk ? PN.WHITE : PN.MUTED_SOFT,
                border: `1px solid ${sedeOk ? 'rgba(0,0,0,0.32)' : PN.BORDER_SOFT_A}`,
                fontSize: 15, fontWeight: 700,
                cursor: sedeOk ? 'pointer' : 'not-allowed', fontFamily:'inherit',
              }}>
              Crea la sede e imposta le sale
            </button>
            <button
              onClick={() => setStep('scelta')}
              style={{
                border:'none', background:'transparent', padding: 0,
                fontSize: 13.5, fontWeight: 600, color: PN.MUTED,
                cursor:'pointer', fontFamily:'inherit',
              }}>
              ← Torna alla scelta
            </button>
          </>
        ) : (
          <>
            {/* Ricerca */}
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display:'inline-flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </span>
              <input
                autoFocus
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null); }}
                placeholder="Cerca il nome del locale…"
                style={{
                  width:'100%', padding:'10px 12px 10px 34px', borderRadius: 10,
                  border:'1px solid rgba(15,17,21,0.14)', outline:'none',
                  background:'rgba(255,255,255,0.85)',
                  fontSize: 15, fontFamily:'inherit', color: PN.TEXT, boxSizing:'border-box',
                }}
              />
            </div>

            {/* Risultati: nome + via e città */}
            <div style={{display:'flex', flexDirection:'column', gap: 6, maxHeight: 240, overflow:'auto'}}>
              {risultati.length === 0 && (
                <div style={{padding:'18px 10px', textAlign:'center', fontSize: 14, color: PN.MUTED}}>
                  Nessun locale trovato con questo nome.
                </div>
              )}
              {risultati.map(d => {
                const sel = selected && selected.id === d.id;
                return (
                  <button key={d.id} onClick={() => setSelected(d)} style={{
                    display:'flex', alignItems:'center', gap: 10, width:'100%',
                    padding:'10px 12px', borderRadius: 10, textAlign:'left',
                    background: sel ? PN.PINK_SOFT : 'rgba(255,255,255,0.65)',
                    border: `1px solid ${sel ? PN.PINK : 'rgba(15,17,21,0.10)'}`,
                    cursor:'pointer', fontFamily:'inherit',
                    transition:'background 120ms, border-color 120ms',
                  }}>
                    <span style={{flex: 1, minWidth: 0}}>
                      <span style={{display:'block', fontSize: 15, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.name}</span>
                      <span style={{display:'block', fontSize: 13.5, color: PN.MUTED, marginTop: 1}}>{d.addr} · {d.city}</span>
                    </span>
                    {sel && (
                      <span style={{display:'inline-flex', color: PN.PINK_DARK, flexShrink: 0}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Conferma */}
            <button
              disabled={!selected}
              onClick={() => selected && onCollega(selected)}
              style={{
                padding: '12px 18px', borderRadius: 999,
                background: selected ? PN.BTN_DARK : PN.WHITE_FROST,
                color: selected ? PN.WHITE : PN.MUTED_SOFT,
                border: `1px solid ${selected ? 'rgba(0,0,0,0.32)' : PN.BORDER_SOFT_A}`,
                fontSize: 15, fontWeight: 700,
                cursor: selected ? 'pointer' : 'not-allowed', fontFamily:'inherit',
              }}>
              Invia richiesta di collegamento
            </button>
            <button
              onClick={() => { setStep('scelta'); setSelected(null); setQuery(''); }}
              style={{
                border:'none', background:'transparent', padding: 0,
                fontSize: 13.5, fontWeight: 600, color: PN.MUTED,
                cursor:'pointer', fontFamily:'inherit',
              }}>
              ← Torna alla scelta
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Input con la stessa veste di AcField, ma modificabile.
function AcEditField({ label, value, onChange, type = 'text', full }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width:'100%', padding:'10px 12px', borderRadius: 10,
          border:`1px solid ${PN.BORDER}`, background: '#FAFBFC',
          fontSize: 15.5, color: PN.TEXT, fontWeight: 500,
          fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          transition:'border-color 150ms, background 150ms, transform 160ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 160ms ease',
        }}
        onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 6px 16px rgba(15, 17, 21, 0.08)'; }}
        onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
        onFocus={e => { e.target.style.borderColor = PN.TEXT; e.target.style.background = PN.WHITE; }}
        onBlur={e => { e.target.style.borderColor = PN.BORDER; e.target.style.background = '#FAFBFC'; }}
      />
    </div>
  );
}

// Select custom con la stessa veste di AcField: il menu nativo del browser
// non è stilizzabile, qui il pannello è in vetro (GLASS_MENU) con hover e
// spunta sull'opzione selezionata.
function AcSelect({ label, value, onChange, options, full }) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <div ref={ref} style={{position:'relative'}}>
        {/* Trigger — veste identica ad AcField */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width:'100%', padding:'10px 12px', borderRadius: 10,
            border:`1px solid ${open ? PN.TEXT : PN.BORDER}`,
            background: open ? PN.WHITE : '#FAFBFC',
            fontSize: 15.5, color: PN.TEXT, fontWeight: 500,
            fontFamily:'inherit', cursor:'pointer', textAlign:'left',
            display:'flex', alignItems:'center', gap: 8,
            transition:'border-color 150ms, background 150ms',
          }}
          onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = PN.BORDER; }}
        >
          <span style={{flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value}</span>
          <span style={{
            display:'inline-flex', color: PN.MUTED, flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition:'transform 180ms ease-out',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </button>

        {/* Pannello opzioni — glass menu come il resto del gestionale */}
        {open && (
          <div className="pn-scroll" style={{
            position:'absolute', top:'calc(100% + 6px)', left: 0, right: 0,
            ...PN.GLASS_MENU,
            zIndex: 60, overflow:'auto', maxHeight: 240,
            padding: 6,
          }}>
            {options.map(o => {
              const selected = o === value;
              const hov = hovered === o;
              return (
                <button
                  key={o}
                  onClick={() => { onChange(o); setOpen(false); }}
                  onMouseEnter={() => setHovered(o)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width:'100%', padding:'9px 10px', borderRadius: 8,
                    border:'none', textAlign:'left', cursor:'pointer',
                    background: hov ? 'rgba(15,17,21,0.05)' : 'transparent',
                    color: PN.TEXT,
                    fontSize: 15, fontWeight: selected ? 700 : 500,
                    fontFamily:'inherit',
                    display:'flex', alignItems:'center', gap: 8,
                    transition:'background 120ms',
                  }}>
                  <span style={{flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{o}</span>
                  {selected && (
                    <span style={{display:'inline-flex', color: PN.PINK_DARK, flexShrink: 0}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Popup gestione foto profilo: anteprima, riposizionamento a trascinamento,
// caricamento nuova, rimozione, requisiti di formato e dimensioni.
function AcFotoModal({ foto, onClose, onSave }) {
  // Copia di lavoro: Annulla scarta, Salva applica.
  const [draft, setDraft] = React.useState(foto);
  const fileRef = React.useRef(null);
  const previewRef = React.useRef(null);
  const SIZE = 200;

  const caricaFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setDraft({ url, pos: { x: 50, y: 50 } });
    e.target.value = '';
  };

  // Trascina per riposizionare: il delta del mouse sposta l'inquadratura
  // (objectPosition) in percentuale, clampata 0–100.
  const startDrag = (e) => {
    if (!draft) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...draft.pos };
    const onMove = (ev) => {
      const dx = ((ev.clientX - startX) / SIZE) * 100;
      const dy = ((ev.clientY - startY) / SIZE) * 100;
      setDraft(d => d && ({ ...d, pos: {
        x: Math.max(0, Math.min(100, startPos.x - dx)),
        y: Math.max(0, Math.min(100, startPos.y - dy)),
      }}));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20, width: 420, maxWidth:'100%',
        padding: '22px 22px 20px',
        display:'flex', flexDirection:'column', gap: 16,
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10}}>
          <div>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Foto profilo</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>
              {draft ? 'Trascina la foto per riposizionarla nel cerchio.' : 'Carica una foto per il tuo profilo.'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Anteprima circolare, trascinabile */}
        <div style={{display:'grid', placeItems:'center'}}>
          <div
            ref={previewRef}
            onMouseDown={startDrag}
            style={{
              width: SIZE, height: SIZE, borderRadius:'50%',
              overflow:'hidden', position:'relative',
              cursor: draft ? 'grab' : 'default',
              background: draft ? PN.WHITE : `linear-gradient(135deg, ${PN.PINK_DARK}, #B91C5C)`,
              border: '3px solid rgba(255,255,255,0.9)',
              boxShadow: '0 8px 24px rgba(15,17,21,0.15)',
              display:'grid', placeItems:'center',
              color: PN.WHITE, fontSize: 64, fontWeight: 800,
              userSelect:'none',
            }}>
            {draft ? (
              <img src={draft.url} alt="Anteprima foto" draggable={false} style={{
                position:'absolute', inset: 0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:`${draft.pos.x}% ${draft.pos.y}%`,
                pointerEvents:'none',
              }}/>
            ) : 'MR'}
          </div>
        </div>

        {/* Azioni foto */}
        <div style={{display:'flex', gap: 8, justifyContent:'center'}}>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={caricaFile} style={{display:'none'}}/>
          <button onClick={() => fileRef.current && fileRef.current.click()} style={{
            display:'inline-flex', alignItems:'center', gap: 7,
            padding:'9px 16px', borderRadius: 999,
            background: PN.BTN_DARK, color: PN.WHITE,
            border: '1px solid rgba(0,0,0,0.32)',
            fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {draft ? 'Carica un\'altra foto' : 'Carica foto'}
          </button>
          {draft && (
            <button onClick={() => setDraft(null)} style={{
              padding:'9px 16px', borderRadius: 999,
              background:'rgba(255,255,255,0.75)', color: PN.RED,
              border: '1px solid rgba(220,38,38,0.35)',
              fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            }}>Rimuovi</button>
          )}
        </div>

        {/* Requisiti */}
        <div style={{
          padding:'10px 14px', borderRadius: 10,
          background:'rgba(255,255,255,0.55)', border:'1px solid rgba(15,17,21,0.08)',
          fontSize: 13.5, color: PN.MUTED, lineHeight: 1.6, textAlign:'center',
        }}>
          Formati accettati: <strong>JPG, PNG o WebP</strong> · minimo <strong>400×400 px</strong><br/>
          consigliato 1000×1000 px · peso massimo 5 MB
        </div>

        {/* Footer */}
        <div style={{display:'flex', gap: 8}}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
            border: '1px solid rgba(15,17,21,0.12)',
            fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
          }}>Annulla</button>
          <button onClick={() => onSave(draft)} style={{
            flex: 1, padding: '11px 14px', borderRadius: 999,
            background: PN.BTN_DARK, color: PN.WHITE,
            border: '1px solid rgba(0,0,0,0.32)',
            fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>Salva foto</button>
        </div>
      </div>
    </div>
  );
}

window.AccDatiGenerali = AccDatiGenerali;
window.AcCard = AcCard;
window.AcField = AcField;
window.AcBtnGhost = AcBtnGhost;


// ─── Il soggetto fiscale, in Account (P-117 · D-104, che rivede D-52) ──────
// L'account è della persona: qui si cambiano i propri recapiti e il proprio
// nome, e basta. Il gesto «Passa la titolarità a un'altra persona» NON esiste
// più, e con lui il record a tipi, tappe e stati che nessuna schermata
// mostrava per intero: nel prodotto non c'è un'operazione di cambio del
// titolare né di passaggio del locale. Chi entra in un locale già registrato
// entra come collaboratore (D-57), e chi ha perso l'accesso passa dal
// ripristino assistito, che restituisce l'accesso alla STESSA persona e non lo
// trasferisce mai.
// Quello che cambia davvero è il soggetto fiscale, e si cambia in Dati
// fiscali: qui si legge chi è, e — se un cambiamento è in corso — che cosa
// manca, con il rimando. Il registro sta in panoramica-tokens.jsx.
const AC_SOGGETTO = { denominazione: 'Cacio e Pepe S.r.l.', piva: 'IT12345678901' };

function AcSoggettoFiscale() {
  const [c, setC] = React.useState(() => window.byupReadSoggettoChange ? byupReadSoggettoChange() : null);
  React.useEffect(() => {
    const ri = () => setC(window.byupReadSoggettoChange ? byupReadSoggettoChange() : null);
    window.addEventListener('byup-soggetto-change', ri);
    return () => window.removeEventListener('byup-soggetto-change', ri);
  }, []);
  const inCorso = !!(c && c.status !== 'completed');
  const concluso = !!(c && c.status === 'completed');
  // Finché il cambiamento non è concluso il soggetto è ancora quello di
  // prima: all'Agenzia, a Stripe e sui documenti già emessi lo è davvero.
  const sog = concluso ? c.nuovo : (c ? { denominazione: c.previous_denominazione, piva: c.previous_vat_number } : AC_SOGGETTO);
  const passi = window.PN_SOGGETTO_PASSI || [];
  const manca = inCorso ? passi.filter(p => !c.steps[p.id]) : [];
  return (
    <div style={{marginTop: 18, paddingTop: 16, borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
      <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
        <div style={{flex: 1, minWidth: 240}}>
          <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform:'uppercase'}}>Soggetto fiscale del locale</div>
          <div style={{fontSize: 15.5, color: PN.TEXT, marginTop: 3}}>
            <b>{sog.denominazione}</b> · P.IVA {sog.piva}
            <span style={{color: PN.MUTED}}> · Cacio e Pepe e le sue sedi</span>
          </div>
          {inCorso && (
            <div data-soggetto-in-corso style={{fontSize: 13.5, color: PN.AMBER, fontWeight: 600, marginTop: 3}}>
              Cambio di soggetto in corso verso {c.nuovo.denominazione}: manca {manca.map(p => p.label.toLowerCase()).join(', ')}
            </div>
          )}
        </div>
        <a href={`byup Impostazioni.html?page=fiscali${inCorso ? '&cambio=' + c.id : ''}`} className="pn-btn-feedback" style={{
          padding:'9px 16px', borderRadius: 999, textDecoration:'none', whiteSpace:'nowrap',
          background: inCorso ? PN.BTN_DARK : PN.WHITE, color: inCorso ? PN.WHITE : PN.TEXT,
          border: `1px solid ${inCorso ? 'rgba(0,0,0,0.32)' : PN.BORDER}`, fontSize: 14, fontWeight: 700,
        }}>{inCorso ? 'Riprendi in Dati fiscali →' : 'Vai a Dati fiscali'}</a>
      </div>
      <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 8, lineHeight: 1.5}}>
        Devi rinnovare la delega all'Agenzia o cambiare il soggetto fiscale del locale? Si fa in <b>Impostazioni → Dati fiscali</b>. Qui si cambiano solo i tuoi dati: l'account è tuo, e il ruolo di titolare è quello che hai su questo soggetto.
      </div>
    </div>
  );
}

