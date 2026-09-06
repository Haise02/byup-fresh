// Ticket — inbox unificata Hubble
// La sezione si chiama Ticket in interfaccia: quello che arriva qui non è
// posta da leggere, è una pratica che si apre, si assegna e si chiude. Gli
// identificatori interni (rotta, componente, file) restano «comunicazioni».
// Email-like: mittente (titolare locale) · ristorante · oggetto · tag · piano · tempo
// Richieste di certificazione alimentare: oggetto standard + allegati (no testo, no select locale)

const { useState: useStateCom, useMemo: useMemoCom } = React;

const MY_ID = 'support1';

const CERT_OGGETTO = 'Richiesta certificazione alimentare';

// ─── Costruzione dataset unificato ──────────────────────────────────────────
// Tutti i ticket arrivano dal titolare di un locale.
// Le richieste di cert sono "standardizzate": oggetto fisso, no body, solo allegati.
const COMUNICAZIONI = (() => {
  // Le autodichiarazioni non aprono un ticket: presa d'atto, nessuna revisione
  // (P-61). Solo chi ha un documento passa da Assistenza.
  const fromCert = CERTIFICAZIONI.filter(c => !certAutodichiarata(c.tipo)).map(c => {
    const locale = LOCALI.find(l => l.id === c.localeId);
    const stato = c.stato === 'pending' ? 'nuova'
               : c.stato === 'approvata' ? 'approvata'
               : c.stato === 'rifiutata' ? 'rifiutata' : 'nuova';
    return {
      id: c.id,
      certRequest: true,
      certTipo: c.tipo,
      localeId: c.localeId,
      senderName: locale?.titolare || '—',
      senderEmail: locale?.email || '',
      oggetto: CERT_OGGETTO,
      desc: '',
      allegati: [{ name: c.file, size: c.size, kind: 'pdf' }],
      data: c.dataInvio,
      stato,
      tags: [],
      assignedTo: c.revisedBy || null,
      motivo: c.motivo,
      revisedAt: c.revisedAt,
      revisedBy: c.revisedBy,
      scadenzaCert: c.scadenzaCert,
    };
  });

  const fromSeg = SEGNALAZIONI
    .filter(s => s.fonte !== 'app_user')
    .map(s => {
      const locale = LOCALI.find(l => l.id === s.localeId);
      const stato = s.stato === 'nuova' ? 'nuova' : s.stato === 'in_corso' ? 'in_corso' : 'risolta';
      return {
        id: s.id,
        certRequest: false,
        localeId: s.localeId,
        senderName: locale?.titolare || '—',
        senderEmail: locale?.email || '',
        oggetto: s.oggetto,
        desc: `Buongiorno,\n\n${s.desc}\n\nRimango in attesa di un vostro riscontro.\n\nGrazie,\n${locale?.titolare || ''}`,
        allegati: s.allegati ? Array.from({length: s.allegati}).map((_,i) => ({ name: `Screenshot_${i+1}.png`, size: '420 KB', kind: 'image' })) : [],
        data: s.data,
        stato,
        tags: [],
        assignedTo: s.assignedTo || null,
        resolvedBy: s.risoltaDa,
        resolvedAt: s.risoltaIl,
      };
    });

  const extras = [
    { id:'M101', localeId:'L1005', oggetto:'Posso anticipare l\'orario di apertura sulla mia scheda Byup?', desc:'Buongiorno,\n\nda lunedì prossimo inizieremo i pranzi alle 12:00 invece che alle 12:30. Riuscite ad aggiornare gli orari di apertura sul nostro profilo Byup? Grazie mille.\n\nA presto,', data:new Date(Date.now() - 35*60000) },
    { id:'M102', localeId:'L1012', oggetto:'Come riattivo le notifiche di prenotazione?', desc:'Salve,\n\ndopo l\'ultimo aggiornamento dell\'app non mi arrivano più le notifiche delle nuove prenotazioni. Ho controllato le impostazioni del telefono e sembrano a posto. Mi potete aiutare?\n\nGrazie.', data:new Date(Date.now() - 2.5*3600000) },
    { id:'M103', localeId:'L1020', oggetto:'Vorrei programmare una demo del piano Plus', desc:'Buongiorno,\n\nstiamo valutando il passaggio al piano Plus. Possiamo fissare una call di 20 minuti per capire bene cosa cambia rispetto allo Starter e quali funzionalità aggiuntive avremmo a disposizione?\n\nDisponibilità preferita: pomeriggio dopo le 16.\n\nGrazie,', data:new Date(Date.now() - 18*3600000), tags:['lead-upgrade'] },
    { id:'M104', localeId:'L1029', oggetto:'Errore export contabilità maggio', desc:'Buongiorno,\n\nquando provo a esportare la contabilità di maggio dal gestionale, mi compare "errore 502" e il file non si scarica. Sto preparando i documenti per il commercialista.\n\nUrgente, grazie.', data:new Date(Date.now() - 8*3600000), tags:['contabilita'], assignedTo:'support2' },
    { id:'M105', localeId:'L1034', oggetto:'Aggiornamento stickers QR per la sala', desc:'Salve,\n\nabbiamo cambiato la disposizione dei tavoli e mi servirebbero nuovi sticker QR aggiornati con i nuovi numeri tavolo. Come posso richiederli?\n\nGrazie!', data:new Date(Date.now() - 26*3600000) },
    { id:'M106', localeId:'L1041', oggetto:'Recensione offensiva da rimuovere', desc:'Buongiorno,\n\nieri sera abbiamo ricevuto una recensione contenente insulti personali al titolare. Vi chiedo gentilmente di valutarne la rimozione secondo le linee guida della community Byup.\n\nGrazie.', data:new Date(Date.now() - 4*3600000), tags:['moderazione'],
      moderazione: { utenteId:'U2007', rating:1, dataRecensione:new Date(Date.now() - 26*3600000), segnalataDa:'locale', motivoSegnalazione:'Insulti personali al titolare',
        testo:'Posto pessimo, il titolare è un incapace e pure maleducato, roba da denuncia. Cibo immangiabile, non andateci mai, gente del genere dovrebbe chiudere e sparire.' } },
    { id:'M108', localeId:'L1014', oggetto:'Recensione che pubblica dati di terzi', desc:'Ciao,\n\nleggendo le recensioni del locale ho notato che una recensione fa nome e cognome di un\'altra persona presente quella sera, senza il suo consenso. Non mi sembra corretto, ve la segnalo.\n\nGrazie.', data:new Date(Date.now() - 6*3600000), tags:['moderazione'], senderName:'Giulia Ferraro', senderEmail:'giulia.ferraro@gmail.com',
      moderazione: { utenteId:'U2015', rating:4, dataRecensione:new Date(Date.now() - 2*86400000), segnalataDa:'utente', motivoSegnalazione:'Contiene dati personali di terzi',
        testo:'Serata fantastica! C\'era anche Marco Terlizzi al tavolo 12 che ha alzato un po\' il gomito ahah. Comunque carbonara top e servizio veloce, torneremo di sicuro.' } },
    { id:'M107', localeId:'L1006', oggetto:'Confermo risoluzione problema stampante', desc:'Confermo che, dopo aver seguito i passaggi indicati dal vostro tecnico, la stampante adesso stampa regolarmente. Grazie per la rapidità.\n\nA presto.', data:new Date(Date.now() - 86400000*4), stato:'risolta' },
  ];
  const extraItems = extras.map(e => {
    const locale = LOCALI.find(l => l.id === e.localeId);
    return {
      id: e.id,
      certRequest: false,
      localeId: e.localeId,
      senderName: e.senderName || locale?.titolare || '—',
      senderEmail: e.senderEmail || locale?.email || '',
      oggetto: e.oggetto,
      moderazione: e.moderazione,
      desc: e.desc + (e.senderName ? `\n\n${e.senderName}` : locale ? `\n\n${locale.titolare}\n${locale.nome}` : ''),
      allegati: e.allegati || [],
      data: e.data,
      stato: e.stato || 'nuova',
      tags: e.tags || [],
      // Serve almeno un ticket in mano a un collega, altrimenti lo stato «ci
      // sta già lavorando qualcun altro» non si vede mai e non si può
      // verificare che il blocco alla risposta funzioni anche lì.
      assignedTo: e.assignedTo || null,
    };
  });

  return [...fromCert, ...fromSeg, ...extraItems].sort((a,b) => b.data - a.data);
})();

// ═════════════════════════════════════════════════════════════════════════════
function AdmComunicazioniPage({ openId }) {
  const [items, setItems] = useStateCom(COMUNICAZIONI);
  const [view, setView] = useStateCom('open');
  React.useEffect(() => { if (openId) { setSelectedId(openId); setView('all'); } }, [openId]);
  const [search, setSearch] = useStateCom('');
  const [selectedId, setSelectedId] = useStateCom(items[0]?.id || null);

  const cAll      = items.length;
  const cOpen     = items.filter(i => i.stato === 'nuova' || i.stato === 'in_corso').length;
  const cCert     = items.filter(i => i.certRequest && i.stato === 'nuova').length;
  const cMine     = items.filter(i => i.assignedTo === MY_ID && (i.stato === 'nuova' || i.stato === 'in_corso')).length;
  const cResolved = items.filter(i => i.stato === 'risolta' || i.stato === 'approvata' || i.stato === 'rifiutata').length;

  const filtered = useMemoCom(() => {
    let r = items;
    if (view === 'open')     r = r.filter(i => i.stato === 'nuova' || i.stato === 'in_corso');
    if (view === 'cert')     r = r.filter(i => i.certRequest && i.stato === 'nuova');
    if (view === 'mine')     r = r.filter(i => i.assignedTo === MY_ID && (i.stato === 'nuova' || i.stato === 'in_corso'));
    if (view === 'resolved') r = r.filter(i => i.stato === 'risolta' || i.stato === 'approvata' || i.stato === 'rifiutata');
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(i => {
        const locale = LOCALI.find(l => l.id === i.localeId);
        return i.oggetto.toLowerCase().includes(q)
          || (i.desc && i.desc.toLowerCase().includes(q))
          || i.senderName.toLowerCase().includes(q)
          || (locale?.nome.toLowerCase().includes(q));
      });
    }
    return [...r].sort((a,b) => b.data - a.data);
  }, [items, view, search]);

  const selected = items.find(i => i.id === selectedId) || filtered[0];

  const updateItem = (id, patch) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    // Write-through al dataset: lo stato deciso qui deve sopravvivere al
    // prossimo montaggio, e una certificazione approvata o rifiutata dal
    // ticket deve dirlo anche al fascicolo del locale (tab Certificazioni) —
    // due superfici, una pratica sola.
    const src = COMUNICAZIONI.find(i => i.id === id);
    if (src) Object.assign(src, patch);
    if (src && src.certRequest && (patch.stato === 'approvata' || patch.stato === 'rifiutata')) {
      const cert = CERTIFICAZIONI.find(c => c.id === id);
      if (cert) {
        cert.stato = patch.stato;
        cert.revisedAt = patch.revisedAt || new Date();
        cert.revisedBy = patch.revisedBy || MY_ID;
        cert.motivo = patch.stato === 'rifiutata' ? (patch.motivo || null) : null;
      }
    }
  };
  const addTag = (id, tag) => {
    const t = tag.trim().replace(/^#/, '');
    if (!t) return;
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (i.tags.includes(t)) return i;
      return { ...i, tags: [...i.tags, t] };
    }));
  };
  const removeTag = (id, tag) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, tags: i.tags.filter(x => x !== tag) } : i));
  };

  const views = [
    { id:'open',     label:'Aperte',         count:cOpen },
    { id:'cert',     label:'Da approvare',   count:cCert,     accent:'WARN' },
    { id:'mine',     label:'Mie',            count:cMine },
    { id:'resolved', label:'Concluse',       count:cResolved },
    { id:'all',      label:'Tutte',          count:cAll },
  ];

  const certUrgent   = items.filter(i => i.certRequest && i.stato === 'nuova' && (Date.now() - i.data.getTime()) > 24*3600000).length;

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
      {/* Barra filtri — i filtri sono navigazione, non KPI: lo spazio va
          all'inbox. Fondo tenue e non bianco: sotto al tab bar di Assistenza,
          due nastri bianchi accostati diventerebbero una fascia sola alta il
          doppio, e le pillole si perderebbero dentro. */}
      <div style={{background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`, padding:'11px 28px', flexShrink:0, display:'flex', flexDirection:'column', gap:10}}>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {views.map(v => {
            const active = view === v.id;
            const urgent = v.id === 'cert' && certUrgent > 0;
            return (
              <button key={v.id} className="adm-pill" onClick={()=>setView(v.id)} style={{
                display:'inline-flex', alignItems:'center', gap:7,
                padding:'7px 13px', borderRadius:99,
                background: active ? ADM.TEXT : '#fff',
                color: active ? '#fff' : ADM.TEXT,
                border:`1px solid ${active ? ADM.TEXT : ADM.BORDER}`,
                fontSize:13.5, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
                transition:'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
              }}>
                {urgent && !active && <span style={{width:6, height:6, borderRadius:'50%', background:ADM.WARN}}/>}
                {v.label}
                <span style={{fontWeight:700, color: active ? 'rgba(255,255,255,0.75)' : ADM.MUTED_SOFT, fontSize:12.5}}>{v.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{flex:1, display:'flex', minHeight:0}}>
        {/* Lista */}
        <div style={{width:440, flexShrink:0, borderRight:`1px solid ${ADM.BORDER}`, background:'#fff', display:'flex', flexDirection:'column', minHeight:0}}>
          {/* Search bar */}
          <div style={{padding:'14px 16px 10px', borderBottom:`1px solid ${ADM.BORDER}`}}>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={18}/></span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca mittente, locale, oggetto…" style={{
                width:'100%', padding:'8px 12px 8px 32px',
                border:'none', borderRadius:8,
                fontSize:14, fontFamily:'inherit', outline:'none',
                background:ADM.PANEL_SOFT, boxSizing:'border-box',
                color:ADM.TEXT,
              }}/>
            </div>
          </div>

          <div style={{padding:'10px 18px 8px', fontSize:13.3, color:ADM.MUTED, fontWeight:500, display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span>
              {filtered.length} ticket
              {view !== 'all' && <span style={{color:ADM.MUTED_SOFT}}> · filtro: <strong style={{color:ADM.TEXT, fontWeight:600}}>{views.find(v=>v.id===view)?.label || 'Tutte'}</strong></span>}
            </span>
            {filtered.some(i=>i.stato==='nuova') && (
              <span style={{display:'inline-flex', alignItems:'center', gap:5, color:ADM.MUTED, fontWeight:600}}><span style={{width:6, height:6, borderRadius:'50%', background:ADM.PINK}}/>{filtered.filter(i=>i.stato==='nuova').length} non lette</span>
            )}
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {filtered.length === 0 && <AdmEmpty title="Nessun ticket" desc="Cambia vista o cancella la ricerca"/>}
            {filtered.map(i => (
              <InboxItem key={i.id} item={i} active={selected?.id===i.id} onClick={()=>setSelectedId(i.id)}/>
            ))}
          </div>
        </div>

        {/* Dettaglio */}
        <div style={{flex:1, display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT, overflow:'hidden', minWidth:0}}>
          {selected
            ? <Thread item={selected} onUpdate={(patch)=>updateItem(selected.id, patch)} onAddTag={(t)=>addTag(selected.id, t)} onRemoveTag={(t)=>removeTag(selected.id, t)}/>
            : <AdmEmpty title="Seleziona un ticket" desc="Dalla lista a sinistra"/>}
        </div>
      </div>
    </div>
  );
}

// ─── Item della lista ───────────────────────────────────────────────────────
function InboxItem({ item, active, onClick }) {
  const locale = LOCALI.find(l => l.id === item.localeId);
  const piano = locale ? PIANI.find(p => p.id === locale.piano) : null;
  const isUnread = item.stato === 'nuova';
  const [hover, setHover] = React.useState(false);

  const ageH = (Date.now() - item.data.getTime()) / 3600000;
  const railColor = (item.stato === 'risolta' || item.stato === 'approvata' || item.stato === 'rifiutata') ? 'transparent'
                  : item.certRequest && ageH > 24 ? ADM.WARN
                  : ageH > 48 ? ADM.DANGER
                  : 'transparent';

  // Per le cert, niente preview (è standard); per le altre la prima riga del corpo
  const preview = item.certRequest
    ? (locale ? `${item.allegati.length} ${item.allegati.length === 1 ? 'allegato' : 'allegati'} · ${CERT_TIPI[item.certTipo]?.label || item.certTipo}` : '')
    : (item.desc.split('\n').filter(Boolean)[0] || '');

  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        padding:'11px 16px 11px 18px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: active ? ADM.PINK_BG_SOFT : (hover ? '#FAFBFC' : 'transparent'),
        cursor:'pointer', position:'relative',
        transition:'background 0.1s',
      }}>
      <div style={{position:'absolute', left:0, top:10, bottom:10, width:3, borderRadius:'0 2px 2px 0', background: active ? ADM.PINK : railColor}}/>

      <div style={{display:'flex', gap:11}}>
        <AdmAvatar name={item.senderName} size={32} bg={`hsl(${(item.localeId?.charCodeAt(1)||0)*17 % 360}, 38%, 52%)`}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:2}}>
            <span style={{fontSize:14.4, fontWeight: isUnread ? 700 : 600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0, flexShrink:1}}>
              {item.senderName}
            </span>
            <div style={{flex:1}}/>
            {isUnread && <span style={{width:7, height:7, background:ADM.PINK, borderRadius:'50%', flexShrink:0}}/>}
            <span style={{fontSize:13, color:ADM.MUTED_SOFT, whiteSpace:'nowrap', flexShrink:0}}>{fmtRelative(item.data)}</span>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
            <span style={{fontSize:12.5, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0, flexShrink:1}}>{locale?.nome || '—'}</span>
          </div>

          <div style={{fontSize:14, fontWeight: isUnread ? 700 : 500, color:ADM.TEXT, marginBottom:3, lineHeight:1.3, letterSpacing:'-0.005em', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{item.oggetto}</div>
          {preview && (
            <div style={{fontSize:12.5, color:ADM.MUTED, marginBottom:6, lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{preview}</div>
          )}

          <div style={{display:'flex', alignItems:'center', gap:5, flexWrap:'wrap'}}>
            {item.certRequest && <CertTag/>}
            {item.tags.slice(0, 3).map(t => <CustomTag key={t} label={t}/>)}
            {item.tags.length > 3 && <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>+{item.tags.length - 3}</span>}
            <div style={{flex:1}}/>
            {item.allegati.length > 0 && (
              <span style={{fontSize:12.6, color:ADM.MUTED, display:'inline-flex', alignItems:'center', gap:3}}>
                <BuIcons.paperclip size={15}/>{item.allegati.length}
              </span>
            )}
            {item.stato === 'in_corso' && <StatoChip stato="in_corso"/>}
            {item.stato === 'approvata' && <StatoChip stato="approvata"/>}
            {item.stato === 'rifiutata' && <StatoChip stato="rifiutata"/>}
            {item.stato === 'risolta' && <StatoChip stato="risolta"/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Atoms tag/badge ────────────────────────────────────────────────────────
function CertTag() {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 8px', borderRadius:5,
      background:ADM.WARN_SOFT, color:'#92400E',
      fontSize:12.6, fontWeight:700,
      letterSpacing:'-0.005em',
    }}>
      <BuIcons.shield size={14}/>
      Certificazione alimentare
    </span>
  );
}

function CustomTag({ label, onRemove }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 8px', borderRadius:5,
      background:'#EEF1F5', color:ADM.TEXT,
      fontSize:12.6, fontWeight:600,
      letterSpacing:'-0.005em',
    }}>
      #{label}
      {onRemove && (
        <button onClick={(e)=>{e.stopPropagation(); onRemove();}} style={{
          marginLeft:2, padding:0, width:12, height:12, borderRadius:'50%',
          background:'transparent', color:ADM.MUTED, border:'none', cursor:'pointer',
          display:'grid', placeItems:'center', fontFamily:'inherit',
        }}>
          <BuIcons.x size={14}/>
        </button>
      )}
    </span>
  );
}

function PlanPill({ piano }) {
  return (
    <span style={{
      padding:'1px 6px', borderRadius:4,
      background:ADM[piano.color+'_SOFT'], color:ADM[piano.color],
      fontSize:13, fontWeight:700, letterSpacing:'0.02em', textTransform:'uppercase',
    }}>{piano.label}</span>
  );
}

function StatoChip({ stato }) {
  const map = {
    in_corso:   { label: 'In lavorazione', color: 'WARN' },
    risolta:    { label: 'Risolta',        color: 'OK'   },
    approvata:  { label: 'Approvata',      color: 'OK'   },
    rifiutata:  { label: 'Rifiutata',      color: 'DANGER' },
  };
  const s = map[stato];
  if (!s) return null;
  return (
    <span style={{
      padding:'1.5px 7px', borderRadius:4,
      background:ADM[s.color+'_SOFT'], color:ADM[s.color],
      fontSize:13, fontWeight:700, letterSpacing:'0.02em', textTransform:'uppercase',
    }}>{s.label}</span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ─── Moderazione recensioni (P-71 · L4-01) ──────────────────────────────────
// La recensione segnalata e tre esiti — rimuovere, mantenere, avvisare — che
// sono tre DECISIONI: removed, warning, no_action, tutte col motivo da elenco
// chiuso più la nota, tutte nel registro MOD_DECISIONI e nell'audit. Anche
// il «no» è una decisione: una segnalazione respinta è dovuta a chi ha
// segnalato, e l'esito gli si comunica (art. 16 par. 5 DSA) — qui la
// comunicazione si rappresenta con destinatario, momento e anteprima, non si
// finge di inviarla. Le scorciatoie sull'autore (sospensione delle recensioni
// / ban) producono comunque la decisione sul contenuto: il ban rimuove; la
// sospensione (P-88, al posto dello shadowban) rimuove o lascia visibile
// secondo la decisione presa sulle esistenti nel popup condiviso con la
// scheda utente, e la sua etichetta di P-71 lo dice nelle due varianti. Chi
// decide è chi è collegato (hubUtenteCorrente), non un id fisso.
function ModerationCard({ item, locale, onUpdate }) {
  const mod = item.moderazione;
  const autore = (typeof UTENTI !== 'undefined' && UTENTI.find(x => x.id === mod.utenteId)) || { id: mod.utenteId, nome: 'Utente ' + mod.utenteId };
  const [popup, setPopup] = useStateCom(null); // 'rimuovi' | 'mantieni' | 'avvisa' | 'sospendi' | 'ban' | null
  // Il motivo di P-71 per la sospensione: quello della segnalazione, se è
  // nell'elenco chiuso.
  const motivoIdSegnalazione = MOD_MOTIVI.some(m => m.value === mod.motivoSegnalazione) ? mod.motivoSegnalazione : MOD_MOTIVI[0].value;
  const [motivo, setMotivo] = useStateCom('');          // la nota
  const [motivoSel, setMotivoSel] = useStateCom(MOD_MOTIVI[0].value);
  React.useEffect(() => { setPopup(null); setMotivo(''); setMotivoSel(MOD_MOTIVI[0].value); }, [item.id]);
  const apri = (quale) => { setPopup(quale); setMotivo(''); setMotivoSel(quale === 'mantieni' ? 'nessuna' : quale === 'avvisa' ? 'non_pertinente' : MOD_MOTIVI[0].value); };

  const chiudi = (azione, motivoId, nota) => {
    const me = hubUtenteCorrente();
    const esito = (azione === 'mantenuta' || azione === 'sospensione_restano') ? 'no_action' : azione === 'avvisato' ? 'warning' : 'removed';
    const quando = new Date();
    const segnalante = mod.segnalataDa === 'locale'
      ? { nome: locale?.titolare || item.senderName, email: locale?.email || item.senderEmail }
      : { nome: item.senderName, email: item.senderEmail };
    const testo = `Gentile ${segnalante.nome}, abbiamo esaminato la sua segnalazione sulla recensione di ${locale?.nome || '—'} del ${fmtDate(mod.dataRecensione)}. Esito: ${MOD_ESITI[esito].label.toLowerCase()}. Motivo: ${modMotivoLabel(motivoId).toLowerCase()}.${nota ? ' ' + nota : ''} Può chiedere un riesame rispondendo a questo messaggio.`;
    const dec = { id: 'MD-' + String(MOD_DECISIONI.length + 1).padStart(4, '0'), ticketId: item.id,
      recensione: { utenteId: mod.utenteId, localeId: item.localeId, testo: mod.testo, rating: mod.rating, data: mod.dataRecensione },
      segnalataDa: mod.segnalataDa, segnalante, motivoSegnalazione: mod.motivoSegnalazione,
      esito, azione, motivo: motivoId, nota: nota || null,
      decisaDa: me.id, decisaDaNome: me.nomeCompleto || me.nome, decisaIl: quando,
      comunicazione: { a: segnalante.email, quando, testo },
      // All'autore la motivazione arriva quando il contenuto è toccato o
      // richiamato — e con la sospensione sempre, nella sua comunicazione.
      autoreAvvisato: esito !== 'no_action' || azione.startsWith('sospensione') };
    MOD_DECISIONI.unshift(dec);
    AUDIT_EVENTS.unshift({ who: me.nomeCompleto || me.nome,
      action: azione.startsWith('sospensione') ? 'ha sospeso dalle recensioni l\'autore della segnalata di' : esito === 'removed' ? 'ha rimosso la recensione di' : esito === 'warning' ? 'ha avvisato l\'autore della recensione di' : 'ha mantenuto la recensione di',
      target: `${autore.nome} su ${locale?.nome || '—'} · ${modMotivoLabel(motivoId)} · esito comunicato a ${segnalante.email}`,
      icon: esito === 'removed' ? 'x' : esito === 'warning' ? 'mail' : 'check', color: esito === 'removed' ? 'DANGER' : esito === 'warning' ? 'WARN' : 'OK', tipo: 'segnalazione', when: quando });
    onUpdate({ stato:'risolta', resolvedBy: me.id, resolvedAt: quando, modEsito:{ azione, esito, motivo: motivoId, nota: nota || null, at: quando, decisioneId: dec.id } });
    // La restrizione decisa qui nasce da una recensione precisa: la portiamo
    // nel registro, altrimenti nell'elenco resterebbe un ban senza causa. La
    // sospensione è già a registro: l'ha scritta il popup condiviso.
    if (azione === 'ban') {
      autore.bannato = true;
      admAggiungiRestrizione(autore, 'ban', {
        motivo: mod.motivoSegnalazione,
        operatore: me.id,
        recensione: {
          locale: locale?.nome || '—', citta: locale?.citta || '',
          rating: mod.rating, testo: mod.testo, data: mod.dataRecensione,
        },
      });
    }
    setPopup(null); setMotivo('');
  };

  const ESITI = {
    rimossa:    { bg:ADM.DANGER_SOFT, bd:`${ADM.DANGER}40`, fg:'#7F1D1D', icona:'x',      bgIco:ADM.DANGER, label:'Recensione rimossa · removed' },
    mantenuta:  { bg:ADM.OK_SOFT,     bd:'#BBF7D0',          fg:'#065F46', icona:'check',  bgIco:ADM.OK,     label:'Recensione mantenuta · no_action' },
    avvisato:   { bg:'#FFF7E6',       bd:'#FDE68A',          fg:'#78350F', icona:'mail',   bgIco:ADM.WARN,   label:'Autore avvisato, recensione mantenuta · warning' },
    sospensione_restano: { bg:'#FFF7E6', bd:'#FDE68A',        fg:'#78350F', icona:'shield', bgIco:ADM.WARN,   label:'Autore sospeso dalle recensioni, la recensione resta visibile · no_action' },
    sospensione_rimosse: { bg:'#FFF7E6', bd:'#FDE68A',        fg:'#78350F', icona:'shield', bgIco:ADM.WARN,   label:'Autore sospeso dalle recensioni, le sue recensioni rimosse · removed' },
    ban:        { bg:ADM.DANGER_SOFT, bd:`${ADM.DANGER}40`, fg:'#7F1D1D', icona:'lock',   bgIco:ADM.DANGER, label:'Utente bannato, recensione rimossa · removed' },
  };
  const esito = item.modEsito ? ESITI[item.modEsito.azione] : null;
  const decisione = item.modEsito && item.modEsito.decisioneId ? MOD_DECISIONI.find(d => d.id === item.modEsito.decisioneId) : null;

  // Motivo da elenco chiuso più nota, uguale per tutti e cinque i popup: la
  // decisione è motivata qualunque sia l'esito.
  const motivoBlocco = (placeholder) => (
    <React.Fragment>
      <div style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5}}>Motivo (obbligatorio)</div>
      <AdmSelect value={motivoSel} onChange={setMotivoSel} options={MOD_MOTIVI} block/>
      <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder={placeholder}
        style={{width:'100%', minHeight:64, marginTop:8, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.3, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:12}}/>
    </React.Fragment>
  );

  const azioneBtn = (onClick, colore, sfondo, bordo, icona, label) => (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
      padding:'10px 16px', background:sfondo, color:colore,
      border:bordo, borderRadius:10, fontSize:13.7, fontWeight:700,
      fontFamily:'inherit', cursor:'pointer', letterSpacing:'-0.005em',
    }}>{icona}{label}</button>
  );

  return (
    <div style={{background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden', boxShadow:'0 1px 2px rgba(15,17,21,0.03)', position:'relative'}}>
      {/* La recensione segnalata */}
      <div style={{padding:'16px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap'}}>
          <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Recensione segnalata</span>
          <span style={{padding:'2px 9px', borderRadius:99, background:ADM.DANGER_SOFT, color:ADM.DANGER, fontSize:12, fontWeight:700}}>
            {mod.segnalataDa === 'locale' ? 'Segnalata dal locale' : 'Segnalata da un utente app'} · {mod.motivoSegnalazione}
          </span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap'}}>
          <AdmAvatar name={autore.nome} size={32}/>
          <div style={{minWidth:0}}>
            <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{autore.nome} <span style={{fontFamily:'ui-monospace,monospace', fontSize:12, color:ADM.MUTED_SOFT, fontWeight:500}}>{autore.id}</span></div>
            <div style={{fontSize:12.5, color:ADM.MUTED}}>su <strong style={{color:ADM.TEXT}}>{locale?.nome || '—'}</strong> · {fmtDate(mod.dataRecensione)}</div>
          </div>
          <div style={{flex:1}}/>
          <span style={{fontSize:14.4, letterSpacing:1, color:'#F5A623'}}>{'★'.repeat(mod.rating)}<span style={{color:ADM.BORDER}}>{'★'.repeat(5 - mod.rating)}</span></span>
        </div>
        <div style={{padding:'12px 14px', background:ADM.PANEL_SOFT, borderLeft:`3px solid ${ADM.INK_SOFT}`, borderRadius:'0 8px 8px 0', fontSize:14, color:ADM.TEXT, lineHeight:1.55, fontStyle:'italic'}}>
          “{mod.testo}”
        </div>
      </div>

      {/* Esito o azioni */}
      {esito ? (
        <div style={{padding:'13px 16px', background:esito.bg, display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:30, height:30, borderRadius:8, background:esito.bgIco, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}>{React.createElement(BuIcons[esito.icona], {size:19})}</div>
          <div style={{flex:1, fontSize:13.7, color:esito.fg}}>
            <strong>{esito.label}</strong>
            {item.modEsito.motivo && <> · {modMotivoLabel(item.modEsito.motivo)}</>}
            {item.modEsito.nota && <> · “{item.modEsito.nota}”</>}
            <span style={{opacity:0.75}}> · decisione {item.modEsito.decisioneId || ''} registrata nell'audit log</span>
            {/* La comunicazione al segnalante, rappresentata: a chi, quando,
                che cosa dice. Nessun invio finto. */}
            {decisione && (
              <div style={{marginTop:8, padding:'9px 11px', background:'rgba(255,255,255,0.72)', borderRadius:8, fontSize:12.6, color:ADM.TEXT, lineHeight:1.5}}>
                <div style={{fontWeight:700}}>Esito comunicato a {decisione.comunicazione.a} · {fmtDateTime(decisione.comunicazione.quando)} · art. 16 par. 5 DSA{decisione.autoreAvvisato ? ' · motivazione anche all\'autore' : ''}</div>
                <div style={{marginTop:3, fontStyle:'italic', color:ADM.MUTED}}>{decisione.comunicazione.testo}</div>
                <div style={{marginTop:3, color:ADM.MUTED_SOFT}}>Decisa da {decisione.decisaDaNome} · {fmtDateTime(decisione.decisaIl)}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 16px'}}>
          <div style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Decisioni di moderazione · motivate, registrate, comunicate al segnalante</div>
          <div style={{fontSize:12.4, color:ADM.MUTED, marginBottom:10, lineHeight:1.45}}>Anche mantenere è una decisione: chi ha segnalato riceve l'esito (art. 16 par. 5 DSA).</div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {azioneBtn(()=>apri('rimuovi'), '#fff', `linear-gradient(135deg, ${ADM.DANGER}, #B91C1C)`, 'none', <BuIcons.x size={17}/>, 'Rimuovi recensione…')}
            {azioneBtn(()=>apri('mantieni'), ADM.TEXT, '#fff', `1px solid ${ADM.BORDER}`, <BuIcons.check size={17}/>, 'Mantieni…')}
            {azioneBtn(()=>apri('avvisa'), ADM.TEXT, '#fff', `1px solid ${ADM.BORDER}`, <BuIcons.mail size={17}/>, 'Avvisa autore…')}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:12, paddingTop:11, borderTop:`1px dashed ${ADM.BORDER_SOFT}`, flexWrap:'wrap'}}>
            <span style={{fontSize:12.5, color:ADM.MUTED}}>Autore recidivo o abusivo?</span>
            <button className="adm-textlink" onClick={()=>apri('sospendi')} style={{background:'none', border:'none', color:ADM.WARN, fontSize:12.7, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3, padding:0}}>Sospendi recensioni…</button>
            <button className="adm-textlink" onClick={()=>apri('ban')} style={{background:'none', border:'none', color:ADM.DANGER, fontSize:12.7, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3, padding:0}}>Banna account…</button>
          </div>
        </div>
      )}

      {/* La sospensione: il popup condiviso con la scheda utente (P-88). Alla
          conferma la decisione di P-71 si chiude nella variante decisa sulle
          esistenti. */}
      {popup === 'sospendi' && (
        <SospensionePopup utente={autore}
          recensione={{ locale: locale?.nome || '—', citta: locale?.citta || '', rating: mod.rating, testo: mod.testo, data: mod.dataRecensione }}
          onClose={()=>setPopup(null)}
          onConferma={(rec)=>chiudi('sospensione_' + rec.esistenti, motivoIdSegnalazione, rec.motivo)}/>
      )}

      {/* Popup di conferma */}
      {popup && popup !== 'sospendi' && (
        <div style={{position:'fixed', inset:0, zIndex:70, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.35)'}} onClick={()=>setPopup(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:430, maxWidth:'92%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            {popup === 'rimuovi' && (<>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere la recensione?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>La recensione sparisce dalla scheda di <strong>{locale?.nome}</strong>. {autore.nome} riceve la motivazione; chi ha segnalato riceve l'esito.</div>
              {motivoBlocco('Nota sul caso — es. insulti personali al titolare nella seconda frase')}
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" disabled={!motivo.trim()} onClick={()=>chiudi('rimossa', motivoSel, motivo.trim())}>Rimuovi recensione</AdmButton>
              </div>
            </>)}
            {popup === 'mantieni' && (<>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Mantenere la recensione?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>La recensione resta com'è. Anche questo è una decisione: chi ha segnalato riceve l'esito e il motivo (art. 16 par. 5 DSA).</div>
              {motivoBlocco('Nota sul caso — es. il tono è duro ma non offende la persona')}
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="primary" size="md" icon="check" disabled={!motivo.trim()} onClick={()=>chiudi('mantenuta', motivoSel, motivo.trim())}>Mantieni</AdmButton>
              </div>
            </>)}
            {popup === 'avvisa' && (<>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Avvisare {autore.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>La recensione resta pubblica; l'autore riceve un richiamo formale sulle linee guida, chi ha segnalato riceve l'esito.</div>
              {motivoBlocco('Testo dell\'avviso — es. il tono della tua recensione viola le nostre linee guida')}
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="primary" size="md" icon="mail" disabled={!motivo.trim()} onClick={()=>chiudi('avvisato', motivoSel, motivo.trim())}>Invia avviso</AdmButton>
              </div>
            </>)}
            {popup === 'ban' && (<>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Bannare l'account di {autore.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{autore.id}</strong> viene <strong style={{color:ADM.DANGER}}>bloccato</strong>: niente più accesso all'app, ordini o recensioni. La recensione segnalata viene rimossa, con motivazione all'autore ed esito a chi ha segnalato. Reversibile dal dettaglio utente.</div>
              {motivoBlocco('Nota sul caso — es. account creato per colpire questo locale')}
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="lock" disabled={!motivo.trim()} onClick={()=>chiudi('ban', motivoSel, motivo.trim())}>Banna account</AdmButton>
              </div>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Thread({ item, onUpdate, onAddTag, onRemoveTag }) {
  const locale = LOCALI.find(l => l.id === item.localeId);
  const piano = locale ? PIANI.find(p => p.id === locale.piano) : null;
  const [reply, setReply] = useStateCom('');
  const [tagInput, setTagInput] = useStateCom('');
  const [rejectMode, setRejectMode] = useStateCom(false);
  const [rejectReason, setRejectReason] = useStateCom('');
  const [composerOpen, setComposerOpen] = useStateCom(false);
  // Conferma transitoria dell'invio: il composer si chiude e il chip lo dice,
  // altrimenti campo svuotato e campo mai compilato sarebbero identici.
  const [inviata, setInviata] = useStateCom(false);
  // Allegati in bozza della risposta: del file serve solo nome e peso — il
  // chip è rimovibile finché non parte col messaggio.
  const [allegatiBozza, setAllegatiBozza] = useStateCom([]);
  const fileRef = React.useRef(null);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    setReply(''); setTagInput('');
    setRejectMode(false); setRejectReason('');
    setComposerOpen(false);
    setInviata(false); setAllegatiBozza([]);
  }, [item.id]);

  const aggiungiAllegato = (f, kind) => {
    if (!f) return;
    const k = kind || (/\.pdf$/i.test(f.name) ? 'pdf' : 'image');
    setAllegatiBozza(prev => [...prev, { name: f.name, size: `${Math.max(1, Math.round(f.size/1024))} KB`, kind: k }]);
  };

  const submitTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    onAddTag(t);
    setTagInput('');
  };

  const approveCert = () => onUpdate({ stato: 'approvata', revisedBy: MY_ID, revisedAt: new Date() });
  const rejectCert = () => {
    if (!rejectReason.trim()) return;
    onUpdate({ stato: 'rifiutata', revisedBy: MY_ID, revisedAt: new Date(), motivo: rejectReason.trim() });
    setRejectMode(false);
  };

  const takeOver = () => onUpdate({ assignedTo: MY_ID, stato: item.stato === 'nuova' ? 'in_corso' : item.stato });

  const ageH = Math.floor((Date.now() - item.data.getTime()) / 3600000);
  const isAssignedToMe = item.assignedTo === MY_ID;
  const assignedTeam = item.assignedTo ? TEAM.find(t => t.id === item.assignedTo) : null;
  const canTakeOver   = item.assignedTo && !isAssignedToMe && (item.stato === 'nuova' || item.stato === 'in_corso');
  const certTipo = item.certRequest ? CERT_TIPI[item.certTipo] : null;

  return (
    <>
      {/* Header */}
      <div style={{padding:'18px 32px 16px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
        {/* Riga 1: stato/chip + assegnazione CTA */}
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap'}}>
          {item.certRequest && <CertTag/>}
          {item.stato === 'in_corso' && <StatoChip stato="in_corso"/>}
          {item.stato === 'approvata' && <StatoChip stato="approvata"/>}
          {item.stato === 'rifiutata' && <StatoChip stato="rifiutata"/>}
          {item.stato === 'risolta' && <StatoChip stato="risolta"/>}
          <span style={{fontSize:13, color:ADM.MUTED, fontFamily:'ui-monospace,monospace', marginLeft:2}}>{item.id}</span>
          <div style={{flex:1}}/>
          {/* Assegnazione */}
          {isAssignedToMe && (
            <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:ADM.PINK_BG_SOFT, color:ADM.PINK_DARK, borderRadius:99, fontSize:13.3, fontWeight:700, letterSpacing:'-0.005em'}}>
              <BuIcons.check size={16}/> Assegnata a te
            </span>
          )}
          {/* L'assegnazione NON si fa più da qui: il pulsante sta in mezzo al
              thread, sotto al messaggio, dove serve. Qui resta solo lo stato —
              di chi è — perché due pulsanti che fanno la stessa cosa a due
              centimetri di distanza si annullano a vicenda. */}
          {canTakeOver && (
            <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.3, color:ADM.MUTED}}>
              <AdmAvatar name={assignedTeam?.nome || ''} size={23}/>
              <span>Assegnata a <b style={{color:ADM.TEXT, fontWeight:600}}>{assignedTeam?.nome?.split(' ')[0]}</b></span>
            </span>
          )}
          {/* «Marca risolta» solo a ticket già tuo — è la fine del lavoro, non
              un modo per liberarsene senza averlo preso — e secondaria, perché
              chiudere non deve risultare più invitante che rispondere. */}
          {isAssignedToMe && item.stato !== 'risolta' && !item.certRequest && (
            <AdmButton variant="secondary" size="sm" icon="check"
              onClick={()=>onUpdate({ stato:'risolta', resolvedBy: MY_ID, resolvedAt: new Date() })}>
              Marca risolta
            </AdmButton>
          )}
        </div>

        {/* Oggetto */}
        <div style={{fontSize:19.4, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.015em', lineHeight:1.25, marginBottom:8}}>{item.oggetto}</div>
        {/* Il ticket di ripristino (P-172 · D-121) non si lavora qui: porta
            alla scheda del locale, tab Account, con la finestra aperta. */}
        {item.ripristinoId && (
          <div data-apri-pratica style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', padding:'12px 14px', borderRadius:12, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderLeft:`3px solid ${ADM.PINK}`, marginBottom:12}}>
            <div style={{flex:1, minWidth:220, fontSize:13.4, color:ADM.TEXT, lineHeight:1.5}}><b>Ripristino dell'accesso.</b> La pratica si chiude dalla scheda del locale, tab Account: metodo di verifica, riferimento alla prova, esito. Il collegamento scade in quarantotto ore, e l'accesso torna alla stessa persona.</div>
            <AdmButton variant="primary" size="sm" icon="lock" onClick={() => window.hubVai && window.hubVai('locali', { openLocale: locale, tab: 'account', pratica: item.ripristinoId })}>Apri la pratica</AdmButton>
          </div>
        )}

        {/* Identity row */}
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', fontSize:14, color:ADM.MUTED}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <AdmAvatar name={item.senderName} size={27} bg={`hsl(${(item.localeId?.charCodeAt(1)||0)*17 % 360}, 38%, 52%)`}/>
            <span style={{color:ADM.TEXT, fontWeight:600}}>{item.senderName}</span>
            <span style={{color:ADM.MUTED_SOFT, fontSize:13.3}}>&lt;{item.senderEmail}&gt;</span>
          </div>
          <span style={{color:ADM.MUTED_LIGHT}}>·</span>
          <span><strong style={{color:ADM.TEXT, fontWeight:600}}>{locale?.nome || '—'}</strong> · {locale?.citta || '—'}</span>
          {piano && <><span style={{color:ADM.MUTED_LIGHT}}>·</span><PlanPill piano={piano}/></>}
          <span style={{color:ADM.MUTED_LIGHT}}>·</span>
          <span>Arrivata {fmtDateTime(item.data)} <span style={{color:ADM.MUTED_SOFT}}>({fmtRelative(item.data)})</span></span>
          <span style={{color:ADM.MUTED_LIGHT}}>·</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5, flexWrap:'wrap'}}>
            {item.tags.map(t => <CustomTag key={t} label={t} onRemove={()=>onRemoveTag(t)}/>)}
            <input
              value={tagInput}
              onChange={e=>setTagInput(e.target.value)}
              onKeyDown={e=>{ if (e.key === 'Enter') submitTag(); }}
              placeholder="+ tag"
              style={{width:64, padding:'2px 6px', border:'none', borderRadius:5, background:ADM.PANEL_SOFT, fontSize:12.5, fontFamily:'inherit', outline:'none', color:ADM.TEXT}}
            />
          </span>
          {ageH > 48 && (item.stato === 'nuova' || item.stato === 'in_corso') && (
            <span style={{color:ADM.DANGER, fontWeight:600}}>· in attesa da {ageH}h</span>
          )}
        </div>
      </div>

      {/* Body scrollable */}
      <div style={{flex:1, overflowY:'auto', padding:'22px 32px', display:'flex', flexDirection:'column', gap:18}}>
        <div style={{maxWidth:920, width:'100%', alignSelf:'center', display:'flex', flexDirection:'column', gap:14}}>

          {/* Email body o card cert */}
          {item.certRequest ? (
            <CertCard
              certTipo={certTipo}
              scadenza={item.scadenzaCert}
              senderName={item.senderName}
              senderEmail={item.senderEmail}
              localeId={item.localeId}
              localeName={locale?.nome}
              data={item.data}
              allegati={item.allegati}
            />
          ) : (
            <EmailBody item={item} locale={locale}/>
          )}

          {/* Le risposte inviate si accodano sotto il messaggio del ristoratore:
              il thread stesso è la prova che l'invio è avvenuto. */}
          {!item.certRequest && (item.messaggi || []).map((m, i) => <ReplyBody key={i} m={m}/>)}

          {item.moderazione && <ModerationCard item={item} locale={locale} onUpdate={onUpdate}/>}

          {/* Azioni cert */}
          {item.certRequest && item.stato === 'nuova' && (
            <div style={{
              background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12,
              padding:'16px 18px',
              boxShadow:'0 1px 2px rgba(15,17,21,0.03)',
            }}>
              {/* P-41 (D-33): approvare e rifiutare chiede Scrittura su
                  Conformità, non sui ticket. La funzione resta nel ticket. */}
              {!hubPuo('conformita', 'scrittura') && (
                <div style={{padding:'10px 13px', borderRadius:10, background:ADM.WARN_SOFT, border:'1px solid #FDE68A', fontSize:13, color:'#78350F', lineHeight:1.5, marginBottom:10}}>
                  Approvare o rifiutare una certificazione richiede <b>Scrittura su Conformità</b>: il tuo ruolo qui legge. Chiedi a chi ce l'ha, o lascia il ticket in attesa.
                </div>
              )}
              {!rejectMode && (
                <div style={{display:'flex', gap:10, flexWrap:'wrap', opacity: hubPuo('conformita', 'scrittura') ? 1 : 0.45, pointerEvents: hubPuo('conformita', 'scrittura') ? 'auto' : 'none'}}>
                  <button onClick={approveCert} style={{
                    flex:'1 1 300px',
                    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                    padding:'12px 18px',
                    background:'linear-gradient(135deg, #16A34A, #15803D)',
                    color:'#fff', border:'none', borderRadius:10,
                    fontSize:14.4, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
                    boxShadow:'0 4px 14px -4px rgba(22,163,74,0.5)',
                    letterSpacing:'-0.005em',
                  }}>
                    <BuIcons.check size={19}/>
                    Approva richiesta di certificazione alimentare
                  </button>
                  <button onClick={()=>setRejectMode(true)} style={{
                    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
                    padding:'12px 18px',
                    background:'#fff', color:ADM.DANGER,
                    border:`1px solid ${ADM.DANGER}40`, borderRadius:10,
                    fontSize:14.4, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
                    letterSpacing:'-0.005em',
                  }}>
                    <BuIcons.x size={19}/>
                    Rifiuta con motivazione
                  </button>
                </div>
              )}
              {rejectMode && (
                <div>
                  <div style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10}}>Motivazione del rifiuto</div>
                  <textarea
                    value={rejectReason}
                    onChange={e=>setRejectReason(e.target.value)}
                    placeholder="Es. documento non leggibile, certificazione scaduta, ente non riconosciuto…"
                    style={{
                      width:'100%', minHeight:90, padding:'10px 12px',
                      border:`1px solid ${ADM.BORDER}`, borderRadius:8,
                      fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
                      background:'#fff', outline:'none', resize:'vertical', boxSizing:'border-box',
                      marginBottom:12,
                    }}
                  />
                  <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                    <AdmButton variant="ghost" size="md" onClick={()=>{ setRejectMode(false); setRejectReason(''); }}>Annulla</AdmButton>
                    <AdmButton variant="primary" size="md" icon="x" disabled={!rejectReason.trim()} onClick={rejectCert}>Invia rifiuto</AdmButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Esito cert già processata */}
          {item.certRequest && item.stato === 'approvata' && (
            <div style={{padding:'14px 16px', background:ADM.OK_SOFT, border:`1px solid #BBF7D0`, borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM.OK, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.check size={21}/></div>
              <div style={{flex:1, fontSize:14.4, color:'#065F46'}}>
                <strong>Certificazione approvata</strong>
                {item.revisedBy && <> da {TEAM.find(t=>t.id===item.revisedBy)?.nome || item.revisedBy}</>}
                {item.revisedAt && <> · {fmtDate(item.revisedAt)}</>}
              </div>
            </div>
          )}
          {item.certRequest && item.stato === 'rifiutata' && (
            <div style={{padding:'14px 16px', background:ADM.DANGER_SOFT, border:`1px solid ${ADM.DANGER}40`, borderRadius:10, display:'flex', alignItems:'flex-start', gap:10}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM.DANGER, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.x size={21}/></div>
              <div style={{flex:1, fontSize:14.4, color:'#7F1D1D'}}>
                <div style={{fontWeight:700, marginBottom:3}}>Certificazione rifiutata
                  {item.revisedBy && <> da {TEAM.find(t=>t.id===item.revisedBy)?.nome || item.revisedBy}</>}
                  {item.revisedAt && <> · {fmtDate(item.revisedAt)}</>}
                </div>
                {item.motivo && <div style={{lineHeight:1.5}}>{item.motivo}</div>}
              </div>
            </div>
          )}

          {/* Non-cert risolta */}
          {!item.certRequest && item.stato === 'risolta' && (
            <div style={{padding:'14px 16px', background:ADM.OK_SOFT, border:`1px solid #BBF7D0`, borderRadius:10, display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:32, height:32, borderRadius:8, background:ADM.OK, color:'#fff', display:'grid', placeItems:'center', flexShrink:0}}><BuIcons.check size={21}/></div>
              <div style={{flex:1, fontSize:14.4, color:'#065F46'}}>
                <strong>Risolta</strong>
                {item.resolvedBy && <> da {TEAM.find(t=>t.id===item.resolvedBy)?.nome || item.resolvedBy}</>}
                {item.resolvedAt && <> · {fmtDate(item.resolvedAt)}</>}
              </div>
              <AdmButton variant="ghost" size="sm" onClick={()=>onUpdate({ stato:'nuova', resolvedBy:null, resolvedAt:null })}>Riapri</AdmButton>
            </div>
          )}

          {/* Il messaggio si legge sempre, ma non si risponde a un ticket che
              non è tuo: senza assegnazione il campo di scrittura non esiste
              proprio, e al suo posto c'è l'unica cosa da fare. È la regola che
              impedisce a due operatori di rispondere alla stessa persona senza
              saperlo — e con la casella lì pronta sarebbe successo, perché
              scrivere è più immediato che ricordarsi di assegnarsi prima. */}
          {!item.certRequest && item.stato !== 'risolta' && !isAssignedToMe && (
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:11,
              padding:'26px 24px 28px', borderRadius:14,
              background:'#fff', border:`1px dashed ${ADM.BORDER}`,
            }}>
              {assignedTeam ? (
                <React.Fragment>
                  <div style={{display:'flex', alignItems:'center', gap:9}}>
                    <AdmAvatar name={assignedTeam.nome} size={26}/>
                    <span style={{fontSize:14.6, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>
                      Ci sta lavorando {assignedTeam.nome.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{fontSize:13.2, color:ADM.MUTED, textAlign:'center', maxWidth:400, lineHeight:1.5}}>
                    Per rispondere devi prima prenderlo tu: così {assignedTeam.nome.split(' ')[0]} vede
                    che è passato di mano e non scrivete in due.
                  </div>
                  <AdmButton variant="secondary" size="md" icon="user" onClick={takeOver}
                    style={{marginTop:3}}>Prendi tu il ticket</AdmButton>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div style={{fontSize:15, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>
                    Questo ticket non è assegnato a nessuno
                  </div>
                  <div style={{fontSize:13.2, color:ADM.MUTED, textAlign:'center', maxWidth:380, lineHeight:1.5}}>
                    Assegnatelo per poter rispondere: finché è di nessuno, chiunque potrebbe
                    scrivere a {item.senderName.split(' ')[0]} nello stesso momento.
                  </div>
                  <AdmButton variant="primary" size="lg" icon="user" onClick={takeOver}
                    style={{marginTop:5, paddingLeft:26, paddingRight:26}}>Assegna a me</AdmButton>
                </React.Fragment>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer — collassato finché non serve: il thread ha la priorità.
          Il nastro ha fondo tenue: il campo di risposta era grigio su bianco e
          spariva. Adesso è bianco su tenue, con bordo pieno e una leggera
          ombra — si legge come una casella in cui si scrive, che è quello che è. */}
      {!item.certRequest && item.stato !== 'risolta' && isAssignedToMe && !composerOpen && (
        <div style={{flexShrink:0, padding:'12px 32px', background:ADM.PANEL_SOFT,
          borderTop:`1px solid ${ADM.BORDER}`, display:'flex', gap:10, alignItems:'center'}}>
          <button onClick={()=>setComposerOpen(true)}
            className="adm-btn"
            style={{
              flex:1, display:'flex', alignItems:'center', gap:9,
              textAlign:'left', padding:'11px 18px', borderRadius:99,
              border:`1px solid ${ADM.BORDER}`, background:'#fff',
              color:ADM.MUTED, fontSize:14, fontFamily:'inherit', cursor:'text',
              boxShadow:'0 1px 2px rgba(15,17,21,0.05)',
            }}>
            <BuIcons.send size={15} color={ADM.MUTED_SOFT}/>
            Rispondi a {item.senderName.split(' ')[0]}…
          </button>
          {inviata && (
            <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'7px 13px', background:ADM.OK_SOFT, color:'#065F46', borderRadius:99, fontSize:13.3, fontWeight:700, whiteSpace:'nowrap'}}>
              <BuIcons.check size={16}/> Risposta inviata
            </span>
          )}
        </div>
      )}
      {!item.certRequest && item.stato !== 'risolta' && isAssignedToMe && composerOpen && (
        <div style={{flexShrink:0, padding:'14px 32px 18px', background:'#fff', borderTop:`1px solid ${ADM.BORDER}`}}>
          {/* Un solo modo di scrivere: al ristoratore. La nota interna era una
              seconda scrittura che restava in casa, e non c'è più. */}
          <div style={{display:'flex', gap:6, marginBottom:10, alignItems:'center'}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:13.4,
              fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em'}}>
              <BuIcons.send size={15} color={ADM.PINK}/> Rispondi a {item.senderName.split(' ')[0]}
            </span>
            <div style={{flex:1}}/>
            <button onClick={()=>setComposerOpen(false)} title="Chiudi" className="adm-iconbtn" style={{width:28, height:28, borderRadius:8, border:'none', background:ADM.NEUTRAL_SOFT, color:ADM.MUTED, cursor:'pointer', display:'grid', placeItems:'center'}}>
              <BuIcons.x size={16}/>
            </button>
          </div>

          <div style={{
            border:`1.5px solid ${ADM.BORDER}`,
            borderRadius:10,
            background:'#fff',
            transition:'all 0.15s',
          }}>
            <textarea
              autoFocus
              value={reply}
              onChange={e=>setReply(e.target.value)}
              placeholder={`Rispondi a ${item.senderName.split(' ')[0]}…`}
              style={{
                width:'100%', minHeight:80, padding:'12px 14px',
                border:'none', borderRadius:10,
                background:'transparent',
                fontSize:14.4, fontFamily:'inherit', color:ADM.TEXT,
                resize:'vertical', outline:'none', boxSizing:'border-box',
              }}
            />
            {allegatiBozza.length > 0 && (
              <div style={{display:'flex', gap:7, flexWrap:'wrap', padding:'0 12px 9px'}}>
                {allegatiBozza.map((a, i) => (
                  <span key={i} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`, borderRadius:7, fontSize:12.6, fontWeight:600, color:ADM.TEXT}}>
                    <BuIcons.paperclip size={14}/>
                    {a.name}
                    <span style={{color:ADM.MUTED_SOFT, fontWeight:500}}>{a.size}</span>
                    <button onClick={()=>setAllegatiBozza(prev => prev.filter((_, j) => j !== i))} title="Rimuovi allegato" style={{padding:0, width:14, height:14, borderRadius:'50%', background:'transparent', border:'none', color:ADM.MUTED, cursor:'pointer', display:'grid', placeItems:'center', fontFamily:'inherit'}}>
                      <BuIcons.x size={13}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'8px 12px',
              borderTop:`1px solid ${ADM.BORDER_SOFT}`,
              flexWrap:'wrap',
            }}>
              {/* Niente «marca risolta» accanto a «Invia»: chiudere il ticket
                  vive in testata e basta. Qui affiancava l'azione di scrittura
                  a quella che la annulla, con il rischio di chiudere per
                  sbaglio invece di rispondere — e comunque la stessa azione
                  ripetuta in due punti non aiuta a capire dove sta di casa. */}
              <input ref={fileRef} type="file" style={{display:'none'}} onChange={e=>{ aggiungiAllegato(e.target.files[0]); e.target.value=''; }}/>
              <input ref={imgRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ aggiungiAllegato(e.target.files[0], 'image'); e.target.value=''; }}/>
              <AdmIconBtn icon="paperclip" label="Allega file" onClick={()=>fileRef.current && fileRef.current.click()}/>
              <AdmIconBtn icon="image" label="Inserisci immagine" onClick={()=>imgRef.current && imgRef.current.click()}/>
              <div style={{flex:1}}/>
              {(() => {
                const handleSend = () => {
                  if (!reply.trim()) return;
                  // La risposta diventa un messaggio del thread, allegati
                  // compresi: senza traccia renderizzata, inviare e non
                  // inviare sarebbero la stessa cosa.
                  onUpdate({
                    stato:'in_corso', assignedTo: item.assignedTo || MY_ID,
                    messaggi: [...(item.messaggi || []), { autore: MY_ID, testo: reply.trim(), data: new Date(), allegati: allegatiBozza }],
                  });
                  setReply(''); setAllegatiBozza([]);
                  setComposerOpen(false);
                  setInviata(true);
                  setTimeout(()=>setInviata(false), 3000);
                };
                return (
                  <button onClick={handleSend} disabled={!reply.trim()} style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    padding:'8px 14px',
                    background: !reply.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #FF1F5A, #C40B45)',
                    color:'#fff', border:'none', borderRadius:8,
                    fontSize:14, fontWeight:700,
                    cursor: !reply.trim() ? 'not-allowed' : 'pointer',
                    fontFamily:'inherit', letterSpacing:'-0.005em',
                    whiteSpace:'nowrap',
                    boxShadow: !reply.trim() ? 'none' : '0 4px 12px -4px rgba(255,31,90,0.55)',
                    transition:'all 0.15s',
                  }}>
                    <BuIcons.send size={17}/>
                    Invia risposta
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Email body card ────────────────────────────────────────────────────────
function EmailBody({ item, locale }) {
  return (
    // Il mittente è già nell'header del thread: qui basta un timbro leggero
    // (e ora che le risposte dell'operatore si accodano, il timbro dice chi parla).
    <div style={{display:'flex', gap:12}}>
      <AdmAvatar name={item.senderName} size={28} bg={`hsl(${(item.localeId?.charCodeAt(1)||0)*17 % 360}, 38%, 52%)`}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:5, flexWrap:'wrap'}}>
          <span style={{fontSize:13, fontWeight:700, color:ADM.TEXT}}>{item.senderName}</span>
          <span style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>{fmtRelative(item.data)}</span>
        </div>
        <div style={{
          padding:'14px 16px',
          background:'#fff',
          border:`1px solid ${ADM.BORDER}`,
          borderRadius:10,
          fontSize:14.8, color:ADM.TEXT, lineHeight:1.6,
          whiteSpace:'pre-wrap',
        }}>{item.desc}</div>
        {item.allegati.length > 0 && (
          <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
            {item.allegati.map((a, i) => <Attachment key={i} a={a}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Risposta dell'operatore nel thread ─────────────────────────────────────
// Stesso impianto di EmailBody, ma il timbro dichiara che parla l'assistenza:
// nel thread le due voci devono distinguersi a colpo d'occhio.
function ReplyBody({ m }) {
  const op = TEAM.find(t => t.id === m.autore);
  return (
    <div style={{display:'flex', gap:12}}>
      <AdmAvatar name={op?.nome || m.autore} size={28}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:5, flexWrap:'wrap'}}>
          <span style={{fontSize:13, fontWeight:700, color:ADM.TEXT}}>{op?.nome || m.autore}</span>
          <span style={{fontSize:11.5, fontWeight:700, color:ADM.PINK_DARK, background:ADM.PINK_BG_SOFT, padding:'1px 8px', borderRadius:99}}>Assistenza Byup</span>
          <span style={{fontSize:12.5, color:ADM.MUTED_SOFT}}>{fmtRelative(m.data)}</span>
        </div>
        <div style={{
          padding:'14px 16px',
          background:'#fff',
          border:`1px solid ${ADM.PINK}30`,
          borderRadius:10,
          fontSize:14.8, color:ADM.TEXT, lineHeight:1.6,
          whiteSpace:'pre-wrap',
        }}>{m.testo}</div>
        {m.allegati?.length > 0 && (
          <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
            {m.allegati.map((a, i) => <Attachment key={i} a={a}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cert request card (standardizzata, solo allegati) ──────────────────────
function CertCard({ certTipo, scadenza, senderName, senderEmail, localeId, localeName, data, allegati }) {
  return (
    <div style={{
      background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:12,
      overflow:'hidden',
      boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
    }}>
      {/* Header riassunto */}
      <div style={{padding:'16px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:14}}>
        <div style={{width:38, height:38, borderRadius:10, background:ADM.WARN_SOFT, color:ADM.WARN, display:'grid', placeItems:'center', flexShrink:0}}>
          <BuIcons.shield size={23}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em'}}>
            {certTipo?.label || '—'}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:2}}>
            Ente indicativo: {certTipo?.ente || '—'}
            {scadenza && <> · scadenza {fmtDate(scadenza)}</>}
            <> · inviata {fmtRelative(data)}</>
          </div>
        </div>
      </div>

      {/* Locale di riferimento (non selezionabile: è del mittente) */}
      <div style={{padding:'14px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div>
          <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Locale</div>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{localeName || '—'}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1, fontFamily:'ui-monospace,monospace'}}>{localeId}</div>
        </div>
        <div>
          <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Profilo</div>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{senderName}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1}}>{senderEmail}</div>
        </div>
      </div>

      {/* Allegati */}
      <div style={{padding:'14px 18px'}}>
        <div style={{fontSize:12.6, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10}}>
          {allegati.length === 1 ? 'Documento allegato' : `${allegati.length} documenti allegati`}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {allegati.map((a, i) => <Attachment key={i} a={a}/>)}
        </div>
      </div>
    </div>
  );
}

function Attachment({ a }) {
  const isPdf = a.kind === 'pdf' || /\.pdf$/i.test(a.name);
  const Icon = BuIcons[isPdf ? 'filePdf' : 'image'];
  const color = isPdf ? ADM.DANGER : ADM.NEUTRAL;
  // Il click apre l'anteprima: nel flusso cert questo chip è l'unico accesso
  // al documento che l'operatore deve approvare o rifiutare — un segnaposto
  // fedele qui, il file vero nel prodotto.
  const [preview, setPreview] = useStateCom(false);
  return (
    <>
      <button onClick={()=>setPreview(true)} style={{
        display:'inline-flex', alignItems:'center', gap:10,
        padding:'9px 14px',
        background:'#fff',
        border:`1px solid ${ADM.BORDER}`,
        borderRadius:9,
        fontFamily:'inherit', cursor:'pointer',
        transition:'all 0.15s',
        textAlign:'left',
      }}>
        <div style={{
          width:30, height:30, borderRadius:7,
          background:`${color}1A`, color,
          display:'grid', placeItems:'center', flexShrink:0,
        }}>
          <Icon size={19}/>
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT, letterSpacing:'-0.005em'}}>{a.name}</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1}}>{a.size}</div>
        </div>
        <BuIcons.download size={18} color={ADM.MUTED}/>
      </button>
      {preview && (
        <div style={{position:'fixed', inset:0, zIndex:70, display:'grid', placeItems:'center', background:'rgba(15,17,21,0.45)'}} onClick={()=>setPreview(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:560, maxWidth:'92%', maxHeight:'86vh', background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease', display:'flex', flexDirection:'column'}}>
            <div style={{padding:'14px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:11, flexShrink:0}}>
              <div style={{width:34, height:34, borderRadius:8, background:`${color}1A`, color, display:'grid', placeItems:'center', flexShrink:0}}>
                <Icon size={20}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14.6, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.005em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</div>
                <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:1}}>{isPdf ? 'Documento PDF' : 'Immagine'} · {a.size}</div>
              </div>
              <button onClick={()=>setPreview(false)} title="Chiudi" className="adm-iconbtn" style={{width:28, height:28, borderRadius:8, border:'none', background:ADM.NEUTRAL_SOFT, color:ADM.MUTED, cursor:'pointer', display:'grid', placeItems:'center', flexShrink:0}}>
                <BuIcons.x size={16}/>
              </button>
            </div>
            <div style={{padding:22, background:ADM.PANEL_SOFT, overflowY:'auto'}}>
              {isPdf ? (
                /* Pagina segnaposto: righe a larghezza fissa, così il mock è
                   deterministico e si legge come "qui c'è un documento". */
                <div style={{background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:6, padding:'28px 30px', boxShadow:'0 2px 8px rgba(15,17,21,0.06)'}}>
                  <div style={{height:13, width:'46%', borderRadius:4, background:'#DDE1E7', marginBottom:18}}/>
                  {['94%','88%','96%','73%','90%','82%','40%'].map((w, i) => (
                    <div key={i} style={{height:8, width:w, borderRadius:4, background:'#ECEEF2', marginBottom:9}}/>
                  ))}
                  <div style={{height:8, width:'62%', borderRadius:4, background:'#ECEEF2', marginTop:16}}/>
                </div>
              ) : (
                <div style={{height:260, borderRadius:8, border:`1px dashed ${ADM.BORDER}`, background:'#fff', display:'grid', placeItems:'center', color:ADM.MUTED_SOFT}}>
                  <BuIcons.image size={44}/>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

window.AdmComunicazioniPage = AdmComunicazioniPage;
