// Registro delle restrizioni sugli utenti app (sospensione delle recensioni /
// ban) + elenco.
//
// Prima le restrizioni esistevano solo come due flag sull'utente accesi da due
// posti diversi — il dettaglio utente e la moderazione delle recensioni. Chi
// era ristretto, da quando e per cosa si poteva scoprire solo aprendo gli
// utenti uno per uno. Qui vive l'elenco: un record per restrizione, con la
// recensione che l'ha causata quando arriva dalla moderazione, le note di chi
// l'ha presa in mano e la revoca.
//
// P-88: lo shadowban non esiste più. Nascondere le recensioni di una persona
// a tutti tranne che a lei, senza dirglielo, è una restrizione della
// visibilità che il DSA (art. 17) vuole motivata e comunicata, con la via per
// contestarla. Al suo posto c'è la SOSPENSIONE DELLE RECENSIONI
// (review_suspension): a tempo (30, 60 o 90 giorni), col motivo obbligatorio,
// con la decisione esplicita sulle recensioni già pubblicate — restano
// visibili, oppure vengono rimosse con un motivo loro — e con la
// comunicazione alla persona, una volta sola, all'applicazione: cosa, fino a
// quando, perché, come contestare. Finita la durata la sospensione scade da
// sola; la revoca anticipata resta possibile e resta a registro.

const RESTRIZIONI = [];
const RST_DURATE = [30, 60, 90];
const RST_TIPI = { review_suspension: 'Sospensione recensioni', ban: 'Ban' };
const rstFine = (data, giorni) => new Date(data.getTime() + giorni * 86400000);
// Chi decide è chi è collegato, non un id fisso.
const rstChi = () => (typeof hubUtenteCorrente === 'function' ? hubUtenteCorrente() : null) || { id: 'admin0', nome: 'Tu' };

// Viva = non revocata e, se a tempo, non ancora scaduta.
function admRestrizioneViva(r) { return !r.revocataIl && (!r.fine || r.fine > new Date()); }
function admRestrizioneScaduta(r) { return !r.revocataIl && !!r.fine && r.fine <= new Date(); }

// La restrizione viva di un utente (di un certo tipo, se chiesto).
function admRestrizioneAttiva(utenteId, tipo) {
  return RESTRIZIONI.find(r => r.utenteId === utenteId && admRestrizioneViva(r) && (!tipo || r.tipo === tipo)) || null;
}

// Il testo che la persona riceve, una volta sola, quando la sospensione parte:
// cosa, fino a quando, perché, cosa succede alle recensioni già scritte, come
// contestare. È derivato dal record, non scritto a mano.
function admTestoComunicazione(rec, utente) {
  if (rec.tipo !== 'review_suspension') return null;
  const nome = utente && utente.nome ? utente.nome.split(' ')[0] : '';
  const esistenti = rec.esistenti === 'rimosse'
    ? `Le recensioni che avevi già pubblicato sono state rimosse: ${rec.motivoRimozione || rec.motivo}.`
    : 'Le recensioni che avevi già pubblicato restano visibili.';
  return `Ciao ${nome}, dal ${fmtDate(rec.data)} al ${fmtDate(rec.fine)} non puoi pubblicare recensioni su Byup. Motivo: ${rec.motivo}. ${esistenti} Se pensi che la decisione sia sbagliata puoi contestarla rispondendo a questo messaggio: la riesaminiamo entro sette giorni.`;
}

function admAggiungiRestrizione(utente, tipo, extra = {}) {
  if (!utente) return null;
  const esistente = admRestrizioneAttiva(utente.id, tipo);
  if (esistente) return esistente;
  const sosp = tipo === 'review_suspension';
  // La sospensione non nasce senza motivo: è ciò che la comunicazione deve dire.
  if (sosp && !(extra.motivo || '').trim()) return null;
  const data = new Date();
  const durataGiorni = sosp ? (RST_DURATE.includes(extra.durataGiorni) ? extra.durataGiorni : 30) : null;
  const rec = {
    id: 'RST' + (RESTRIZIONI.length + 1) + '-' + utente.id,
    utenteId: utente.id,
    tipo,                                   // 'review_suspension' | 'ban'
    data,
    durataGiorni,                           // solo per la sospensione: 30 | 60 | 90
    fine: sosp ? rstFine(data, durataGiorni) : null,
    motivo: extra.motivo || null,
    // Il riferimento alla decisione di moderazione da cui la restrizione
    // discende (P-156.7): il modello lo rende obbligatorio per quelle che ne
    // hanno una; il ban disposto dalla scheda utente non ne ha e resta vuoto.
    decisione: extra.decisione || null,
    esistenti: sosp ? (extra.esistenti === 'rimosse' ? 'rimosse' : 'restano') : null,   // sulle recensioni già pubblicate
    motivoRimozione: sosp && extra.esistenti === 'rimosse' ? (extra.motivoRimozione || extra.motivo) : null,
    recensione: extra.recensione || null,   // { locale, citta, rating, testo, data }
    note: extra.note || '',
    operatore: extra.operatore || rstChi().id,
    comunicazione: null,                    // { quando, testo, contestazione } — una volta sola
    revocataIl: null,
    revocataDa: null,
  };
  if (sosp) rec.comunicazione = { quando: data, testo: admTestoComunicazione(rec, utente), contestazione: true };
  RESTRIZIONI.unshift(rec);
  return rec;
}

function admRevocaRestrizione(rec, chi) {
  if (!rec || rec.revocataIl) return;
  rec.revocataIl = new Date();
  rec.revocataDa = chi || rstChi().id;
}

// Revoca la restrizione viva di un utente — usata dalle azioni "Rimuovi ban"
// che partono dal dettaglio utente, dove si ragiona sull'utente e non sul record.
function admRevocaPerUtente(utenteId, tipo, chi) {
  admRevocaRestrizione(admRestrizioneAttiva(utenteId, tipo), chi);
}

// ─── Seed ───────────────────────────────────────────────────────────────────
// Casi finti ma plausibili, così l'elenco non nasce vuoto: i flag sull'utente
// e i record qui restano allineati.
//
// Migrazione dal vecchio regime (P-88): gli shadowban del seme diventano
// sospensioni a 30, 60 o 90 giorni, col motivo, la decisione sulle esistenti
// e la comunicazione. Le recensioni che lo shadowban nascondeva tornano
// visibili, salvo rimozione motivata: qui vengono rimosse solo le incentivate.
// Il caso applicato «dal dettaglio utente» senza motivo non può più esistere
// così: il motivo glielo dà la telefonata che era rimasta nella nota.
(function seedRestrizioni() {
  if (typeof UTENTI === 'undefined' || !UTENTI.length) return;
  const attivi = (typeof LOCALI !== 'undefined' ? LOCALI.filter(l => l.stato === 'active') : []);
  const loc = (i) => attivi[i % Math.max(attivi.length, 1)] || { nome: 'Locale', citta: '—' };
  const g = (n) => new Date(Date.now() - n * 86400000);

  const seed = [
    { i: 4, tipo:'review_suspension', giorni: 6, durata: 30, esistenti:'restano', motivo:'Recensioni a una stella in serie sullo stesso locale',
      operatore:'support1', rating:1, li:0, giorniRev: 8,
      testo:'Posto orribile, personale scortese, non tornerò mai più. Da evitare assolutamente.',
      note:'Terza segnalazione dallo stesso locale in due settimane. Nessun ordine collegato alle recensioni: profilo probabilmente ostile.' },
    { i: 11, tipo:'ban', giorni: 12, motivo:'Insulti al personale nella recensione segnalata',
      operatore:'admin1', rating:1, li:2, giorniRev: 13,
      testo:'Il cameriere è un incompetente, gente così andrebbe licenziata subito.',
      note:'Rimborso dell\'ultimo ordine già erogato prima del ban. Se scrive all\'assistenza, rimandare a me.' },
    { i: 19, tipo:'review_suspension', giorni: 21, durata: 60, esistenti:'rimosse',
      motivo:'Sospetto di recensioni incentivate',
      motivoRimozione:'Quattro recensioni a cinque stelle in due giorni su locali dello stesso gruppo, senza un ordine in app: incentivate',
      operatore:'admin1', rating:5, li:5, giorniRev: 24,
      testo:'Il migliore della città, cinque stelle meritatissime, andateci tutti!',
      note:'Quattro recensioni a cinque stelle in due giorni su locali dello stesso gruppo, nessun ordine in app.' },
    { i: 27, tipo:'review_suspension', giorni: 34, durata: 90, esistenti:'restano',
      motivo:'Recensioni ripetute sullo stesso locale dopo la segnalazione telefonica del titolare', operatore:'admin0',
      note:'Applicata dal dettaglio utente dopo la telefonata del locale. Da rivedere a fine mese.' },
    { i: 33, tipo:'ban', giorni: 58, motivo:'Account usato per ordini con carte contestate',
      operatore:'admin2', note:'Segnalazione arrivata da Stripe, tre chargeback in un mese. Non revocare senza passare da Marco.' },
  ];

  const record = (u, s, k, l) => {
    const sosp = s.tipo === 'review_suspension';
    const data = g(s.giorni);
    const rec = {
      id: 'RST-seed-' + k,
      utenteId: u.id,
      tipo: s.tipo,
      data,
      durataGiorni: sosp ? s.durata : null,
      fine: sosp ? rstFine(data, s.durata) : null,
      motivo: s.motivo,
      esistenti: sosp ? s.esistenti : null,
      motivoRimozione: sosp && s.esistenti === 'rimosse' ? s.motivoRimozione : null,
      recensione: s.testo ? {
        locale: l.nome, citta: l.citta, rating: s.rating,
        testo: s.testo, data: g(s.giorniRev ?? s.giorni + 2),
      } : null,
      note: s.note || '',
      operatore: s.operatore,
      comunicazione: null,
      revocataIl: s.revocataIl || null,
      revocataDa: s.revocataDa || null,
    };
    if (sosp) rec.comunicazione = { quando: data, testo: admTestoComunicazione(rec, u), contestazione: true };
    return rec;
  };

  seed.forEach((s, k) => {
    const u = UTENTI[s.i];
    if (!u) return;
    RESTRIZIONI.push(record(u, s, k, loc(s.li ?? k)));
    if (s.tipo === 'ban') u.bannato = true; else u.sospensioneRecensioni = true;
  });

  // Un caso già chiuso: serve a far vedere che la revoca lascia traccia.
  const uRev = UTENTI[37];
  if (uRev) {
    RESTRIZIONI.push(record(uRev, {
      tipo: 'review_suspension', giorni: 96, durata: 30, esistenti: 'restano',
      motivo: 'Recensione fuori tema segnalata dal locale', rating: 2, giorniRev: 99,
      testo: 'Il cibo va bene ma il parcheggio della zona è una vergogna, il Comune dovrebbe vergognarsi.',
      note: 'Chiarito al telefono, ha riscritto la recensione senza la parte sul Comune.',
      operatore: 'support1', revocataIl: g(74), revocataDa: 'admin1',
    }, 'rev', loc(7)));
  }

  RESTRIZIONI.sort((a, b) => b.data - a.data);
})();

// ─── Elenco restrizioni ─────────────────────────────────────────────────────
const { useState: useStateRst } = React;

function AdmRestrizioniModal({ onClose, onOpenUtente }) {
  const [filtro, setFiltro] = useStateRst('attive');
  const [search, setSearch] = useStateRst('');
  const [revocaRec, setRevocaRec] = useStateRst(null);
  const [, forceTick] = useStateRst(0);
  const refresh = () => forceTick(n => n + 1);

  const utenteDi = (r) => (UTENTI.find(u => u.id === r.utenteId) || { id: r.utenteId, nome: 'Utente ' + r.utenteId, email: '—', citta: '—', regione: '' });
  const nomeOperatore = (id) => {
    const t = (typeof TEAM !== 'undefined' ? TEAM : []).find(x => x.id === id);
    return t ? (t.isYou ? 'Tu' : t.nome) : '—';
  };

  const attive = RESTRIZIONI.filter(admRestrizioneViva);
  const conta = {
    attive: attive.length,
    sospensioni: attive.filter(r => r.tipo === 'review_suspension').length,
    ban: attive.filter(r => r.tipo === 'ban').length,
    chiuse: RESTRIZIONI.filter(r => !admRestrizioneViva(r)).length,
  };

  // «Chiuse» = revocate o scadute: la sospensione a tempo finisce da sola.
  const lista = RESTRIZIONI.filter(r => {
    const viva = admRestrizioneViva(r);
    if (filtro === 'attive' && !viva) return false;
    if (filtro === 'sospensioni' && (!viva || r.tipo !== 'review_suspension')) return false;
    if (filtro === 'ban' && (!viva || r.tipo !== 'ban')) return false;
    if (filtro === 'chiuse' && viva) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const u = utenteDi(r);
      const dove = [u.nome, u.email, u.id, r.motivo || '', r.note || '', r.recensione?.locale || ''].join(' ').toLowerCase();
      if (!dove.includes(q)) return false;
    }
    return true;
  });

  const confermaRevoca = () => {
    const r = revocaRec;
    if (!r) return;
    admRevocaRestrizione(r, rstChi().id);
    const u = UTENTI.find(x => x.id === r.utenteId);
    if (u) { if (r.tipo === 'ban') u.bannato = false; else u.sospensioneRecensioni = false; }
    setRevocaRec(null);
    refresh();
  };

  const FILTRI = [
    { id:'attive',      label:'Tutte le attive',        n: conta.attive },
    { id:'sospensioni', label:'Sospensione recensioni', n: conta.sospensioni },
    { id:'ban',         label:'Ban',                    n: conta.ban },
    { id:'chiuse',      label:'Revocate o scadute',     n: conta.chiuse },
  ];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:55,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:1020, maxWidth:'96%', maxHeight:'90%', background:'#fff',
        borderRadius:18, overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.22s cubic-bezier(0.22,0.9,0.35,1)',
      }}>
        {/* Header */}
        <div style={{padding:'16px 24px 14px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Utenti app</span>
            <AdmIconBtn icon="x" onClick={onClose}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{
              width:42, height:42, borderRadius:12, flexShrink:0,
              background:ADM.WARN_SOFT, color:ADM.WARN, display:'grid', placeItems:'center',
            }}><BuIcons.shield size={22}/></div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:18, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.02em'}}>Restrizioni</div>
              <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1}}>
                Chi è sospeso dalle recensioni o bannato, da quando, fino a quando e per cosa. La sospensione scade da sola; la revoca è immediata e resta a registro.
              </div>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:14, flexWrap:'wrap'}}>
            {FILTRI.map(f => {
              const on = filtro === f.id;
              return (
                <button key={f.id} onClick={()=>setFiltro(f.id)} className="adm-pill" style={{
                  display:'inline-flex', alignItems:'center', gap:7,
                  padding:'6px 12px', borderRadius:8,
                  background: on ? ADM.TEXT : '#fff',
                  color: on ? '#fff' : ADM.MUTED,
                  border: on ? '1px solid transparent' : `1px solid ${ADM.BORDER}`,
                  fontSize:12.8, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                }}>
                  {f.label}
                  <span style={{
                    fontSize:12, fontWeight:700,
                    background: on ? 'rgba(255,255,255,0.18)' : ADM.PANEL_SOFT,
                    color: on ? '#fff' : ADM.MUTED_SOFT,
                    padding:'0 6px', borderRadius:99,
                  }}>{f.n}</span>
                </button>
              );
            })}
            <div style={{flex:1}}/>
            <div style={{position:'relative', flex:'0 0 240px'}}>
              <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={19}/></span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca utente, locale o motivo…" style={{
                width:'100%', padding:'7px 10px 7px 32px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box',
              }}/>
            </div>
          </div>
        </div>

        {/* Elenco */}
        <div style={{flex:1, overflow:'auto', padding:'16px 24px 22px', background:ADM.PANEL_SOFT, display:'flex', flexDirection:'column', gap:12}}>
          {lista.length === 0 && (
            <AdmEmpty icon="shield"
              title={filtro === 'chiuse' ? 'Nessuna restrizione chiusa' : 'Nessuna restrizione attiva'}
              desc={search.trim() ? 'Nessun risultato per questa ricerca' : 'Sospensioni e ban compaiono qui appena vengono applicati'}/>
          )}
          {lista.map(r => (
            <RestrizioneCard key={r.id} rec={r} utente={utenteDi(r)}
              operatore={nomeOperatore(r.operatore)}
              revocataDa={r.revocataDa ? nomeOperatore(r.revocataDa) : null}
              onRevoca={()=>setRevocaRec(r)}
              onApriUtente={onOpenUtente ? ()=>{ onOpenUtente(utenteDi(r)); onClose(); } : null}
              onNota={refresh}/>
          ))}
        </div>

        {/* Popup conferma revoca */}
        {revocaRec && (
          <div style={{position:'fixed', inset:0, zIndex:70, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setRevocaRec(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:430, maxWidth:'92%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>
                Rimuovere {revocaRec.tipo === 'ban' ? 'il ban' : 'la sospensione delle recensioni'} a {utenteDi(revocaRec).nome}?
              </div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                {revocaRec.tipo === 'ban'
                  ? 'L\'account torna operativo: accesso all\'app, ordini e recensioni di nuovo attivi.'
                  : 'Può di nuovo pubblicare recensioni prima della scadenza; quelle già pubblicate restano come sono.'}
                {' '}La restrizione resta nel registro come revocata, con le note già scritte.
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setRevocaRec(null)}>Annulla</AdmButton>
                <AdmButton variant="primary" size="md" icon="check" onClick={confermaRevoca}>Rimuovi restrizione</AdmButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Riga dell'elenco ───────────────────────────────────────────────────────
// Testata con chi e quando, e sotto due colonne: a sinistra la recensione che
// ha fatto scattare la restrizione (se c'è), a fianco le note operative.
function RestrizioneCard({ rec, utente: u, operatore, revocataDa, onRevoca, onApriUtente, onNota }) {
  const [nota, setNota] = useStateRst(rec.note || '');
  const [salvata, setSalvata] = useStateRst(false);
  const revocata = !!rec.revocataIl;
  const scaduta = admRestrizioneScaduta(rec);
  const viva = !revocata && !scaduta;
  const isBan = rec.tipo === 'ban';

  const salvaNota = () => {
    rec.note = nota;
    setSalvata(true);
    setTimeout(()=>setSalvata(false), 1800);
    onNota && onNota();
  };

  return (
    <AdmCard padding={0} style={{opacity: viva ? 1 : 0.72}}>
      {/* Testata */}
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, flexWrap:'wrap'}}>
        <AdmAvatar name={u.nome} size={38} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
        <div style={{minWidth:0, flex:'1 1 180px'}}>
          <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
            {u.nome}
            <span style={{fontFamily:'ui-monospace,monospace', fontSize:12, color:ADM.MUTED_SOFT, fontWeight:500}}>{u.id}</span>
          </div>
          <div style={{fontSize:13, color:ADM.MUTED, marginTop:1}}>{u.email}{u.citta ? ` · ${u.citta}` : ''}</div>
        </div>

        <div style={{flex:'0 0 auto'}}>
          {revocata
            ? <AdmBadge color="PLAN_FREE" size="xs">✓ Revocata</AdmBadge>
            : scaduta
              ? <AdmBadge color="PLAN_FREE" size="xs">○ Scaduta</AdmBadge>
              : isBan
                ? <AdmBadge color="DANGER" size="xs">⊘ Bannato</AdmBadge>
                : <AdmBadge color="WARN" size="xs">◐ Sospensione recensioni</AdmBadge>}
        </div>

        <div style={{flex:'0 0 auto', minWidth:150}}>
          <div style={{fontSize:13.3, color:ADM.TEXT}}>
            {isBan ? 'Bannato' : 'Sospeso dalle recensioni'} dal <strong>{fmtDate(rec.data)}</strong>
            {rec.fine && <> al <strong>{fmtDate(rec.fine)}</strong></>}
          </div>
          <div style={{fontSize:12.6, color:ADM.MUTED_SOFT, marginTop:1}}>
            {fmtRelative(rec.data)}{rec.durataGiorni ? ` · ${rec.durataGiorni} giorni` : ''} · da {operatore}
            {revocata && <> · revocata {fmtDate(rec.revocataIl)} da {revocataDa}</>}
          </div>
        </div>

        <div style={{flex:1}}/>
        {onApriUtente && (
          <button className="adm-textlink" onClick={onApriUtente} style={{
            background:'transparent', border:'none', color:ADM.MUTED, fontSize:12.7, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
          }}>Apri utente</button>
        )}
        {viva && (
          <AdmButton variant="secondary" size="sm" icon="check" disabled={!hubPuo('moderazione', 'scrittura')}
            title={hubPuo('moderazione', 'scrittura') ? undefined : 'Serve Scrittura su Moderazione'} onClick={onRevoca}>Rimuovi restrizione</AdmButton>
        )}
      </div>

      {/* Motivo */}
      {rec.motivo && (
        <div style={{padding:'10px 18px 0', fontSize:13.3, color:ADM.TEXT}}>
          <span style={{color:ADM.MUTED}}>Motivo · </span>{rec.motivo}
        </div>
      )}
      {/* P-88: la decisione sulle esistenti e la comunicazione, entrambe a
          registro — la seconda è quella che la persona ha ricevuto, una sola
          volta, con la via per contestare. */}
      {rec.tipo === 'review_suspension' && (
        <div style={{padding:'6px 18px 0', fontSize:13.3, color:ADM.TEXT}}>
          <span style={{color:ADM.MUTED}}>Recensioni già pubblicate · </span>
          {rec.esistenti === 'rimosse' ? <>rimosse — {rec.motivoRimozione}</> : 'restano visibili'}
        </div>
      )}
      {rec.comunicazione && (
        <div style={{padding:'6px 18px 0', fontSize:12.8, color:ADM.MUTED, lineHeight:1.45}}>
          Comunicata alla persona il {fmtDate(rec.comunicazione.quando)}, una volta sola, con la via per contestare: <span style={{fontStyle:'italic'}}>“{rec.comunicazione.testo}”</span>
        </div>
      )}

      {/* Recensione all'origine + note a fianco */}
      <div style={{
        display:'grid', gridTemplateColumns:'minmax(0,1.5fr) minmax(0,1fr)',
        gap:18, padding:'12px 18px 16px',
      }}>
        <div>
          <div style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7}}>
            Recensione all'origine
          </div>
          {rec.recensione ? (
            <div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap'}}>
                <span style={{fontSize:13.7, fontWeight:600, color:ADM.TEXT}}>{rec.recensione.locale}</span>
                <span style={{fontSize:12.6, color:ADM.MUTED}}>{rec.recensione.citta} · {fmtDate(rec.recensione.data)}</span>
                <div style={{flex:1}}/>
                <span style={{fontSize:14, letterSpacing:1, color:'#F5A623'}}>
                  {'★'.repeat(rec.recensione.rating || 0)}<span style={{color:ADM.BORDER}}>{'★'.repeat(5 - (rec.recensione.rating || 0))}</span>
                </span>
              </div>
              <div style={{padding:'10px 13px', background:ADM.PANEL_SOFT, borderLeft:`3px solid ${isBan ? ADM.DANGER : ADM.WARN}`, borderRadius:'0 8px 8px 0', fontSize:13.3, color:ADM.TEXT, lineHeight:1.5, fontStyle:'italic'}}>
                “{rec.recensione.testo}”
              </div>
            </div>
          ) : (
            <div style={{padding:'10px 13px', background:ADM.PANEL_SOFT, borderRadius:8, fontSize:13, color:ADM.MUTED_SOFT, lineHeight:1.5}}>
              Nessuna recensione collegata — restrizione applicata dal dettaglio utente.
            </div>
          )}
        </div>

        <div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:7}}>
            <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em'}}>Note</span>
            {salvata && <span style={{fontSize:12, color:ADM.OK, fontWeight:700}}>✓ salvata</span>}
          </div>
          <textarea value={nota} onChange={e=>setNota(e.target.value)} onBlur={salvaNota}
            placeholder="Note interne — cosa è successo, cosa fare se scrive all'assistenza…"
            style={{
              width:'100%', minHeight:78, padding:'9px 12px',
              border:`1px solid ${ADM.BORDER}`, borderRadius:8,
              fontSize:13, fontFamily:'inherit', color:ADM.TEXT, lineHeight:1.5,
              outline:'none', resize:'vertical', boxSizing:'border-box', background:'#fff',
            }}/>
        </div>
      </div>
    </AdmCard>
  );
}

// ─── Il popup della sospensione, unico ──────────────────────────────────────
// Lo aprono la scheda utente (tab Recensioni) e la moderazione delle
// segnalazioni: stessi campi, stesso record, stesso operatore — chi è
// collegato (hubUtenteCorrente), non un id fisso. Durata a scelta chiusa,
// motivo obbligatorio, decisione esplicita sulle recensioni già pubblicate e
// l'anteprima della comunicazione che parte una volta sola.
function SospensionePopup({ utente, recensione, onClose, onConferma }) {
  const [durata, setDurata] = useStateRst(30);
  const [motivo, setMotivo] = useStateRst('');
  const [esistenti, setEsistenti] = useStateRst('restano');
  const [motivoRimozione, setMotivoRimozione] = useStateRst('');
  const chi = rstChi();
  const puo = typeof hubPuo !== 'function' || hubPuo('moderazione', 'scrittura');
  const valido = puo && !!motivo.trim() && (esistenti === 'restano' || !!motivoRimozione.trim());
  const oggi = new Date();
  const bozza = { tipo:'review_suspension', data: oggi, fine: rstFine(oggi, durata), motivo: motivo.trim() || '…', esistenti, motivoRimozione: motivoRimozione.trim() || '…' };

  const conferma = () => {
    if (!valido) return;
    utente.sospensioneRecensioni = true;
    const rec = admAggiungiRestrizione(utente, 'review_suspension', {
      durataGiorni: durata, motivo: motivo.trim(), esistenti,
      motivoRimozione: motivoRimozione.trim() || null, recensione: recensione || null, operatore: chi.id,
      decisione: recensione ? (recensione.decisioneId || recensione.segnalazioneId || recensione.id || null) : null,
    });
    if (typeof AUDIT_EVENTS !== 'undefined') AUDIT_EVENTS.unshift({
      who: chi.nomeCompleto || chi.nome, action: `ha sospeso dalle recensioni per ${durata} giorni`,
      target: `${utente.nome} · ${motivo.trim()} · esistenti ${esistenti === 'rimosse' ? 'rimosse' : 'visibili'} · comunicato alla persona`,
      icon:'shield', color:'WARN', tipo:'segnalazione', when: oggi });
    onConferma && onConferma(rec);
  };

  const etichetta = { fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 };
  const campo = { width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13, fontFamily:'inherit', color:ADM.TEXT, outline:'none', boxSizing:'border-box', background:'#fff' };
  const scelta = (on) => ({
    padding:'6px 12px', borderRadius:8, fontSize:12.8, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
    background: on ? ADM.TEXT : '#fff', color: on ? '#fff' : ADM.MUTED, border: on ? '1px solid transparent' : `1px solid ${ADM.BORDER}`,
  });

  return (
    <div style={{position:'fixed', inset:0, zIndex:70, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:480, maxWidth:'92%', maxHeight:'92%', overflow:'auto', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
        <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Sospendere {utente.nome} dalle recensioni?</div>
        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:14}}>
          Per la durata scelta non può pubblicare recensioni. Riceve subito la comunicazione qui sotto, una volta sola, col motivo e la via per contestare. La sospensione scade da sola; si può revocare prima dal registro. Decide {chi.nomeCompleto || chi.nome}.
        </div>

        <div style={etichetta}>Durata</div>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          {RST_DURATE.map(d => <button key={d} className="adm-pill" style={scelta(durata === d)} onClick={()=>setDurata(d)}>{d} giorni</button>)}
        </div>

        <div style={etichetta}>Motivo · obbligatorio</div>
        <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Es. terza recensione ostile sullo stesso locale senza un ordine collegato" style={{...campo, minHeight:64, resize:'vertical', marginBottom:12}}/>

        <div style={etichetta}>Recensioni già pubblicate</div>
        <div style={{display:'flex', gap:8, marginBottom: esistenti === 'rimosse' ? 8 : 12}}>
          <button className="adm-pill" style={scelta(esistenti === 'restano')} onClick={()=>setEsistenti('restano')}>Restano visibili</button>
          <button className="adm-pill" style={scelta(esistenti === 'rimosse')} onClick={()=>setEsistenti('rimosse')}>Vengono rimosse</button>
        </div>
        {esistenti === 'rimosse' && (
          <input value={motivoRimozione} onChange={e=>setMotivoRimozione(e.target.value)} placeholder="Motivo della rimozione · obbligatorio" style={{...campo, marginBottom:12}}/>
        )}

        <div style={etichetta}>Comunicazione alla persona · una volta sola</div>
        <div style={{padding:'10px 13px', background:ADM.PANEL_SOFT, borderLeft:`3px solid ${ADM.WARN}`, borderRadius:'0 8px 8px 0', fontSize:12.8, color:ADM.TEXT, lineHeight:1.5, fontStyle:'italic', marginBottom:16}}>
          “{admTestoComunicazione(bozza, utente)}”
        </div>

        {!puo && <div style={{fontSize:12.5, color:ADM.DANGER, marginBottom:10}}>Serve Scrittura su Moderazione.</div>}
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <AdmButton variant="ghost" size="md" onClick={onClose}>Annulla</AdmButton>
          <AdmButton variant="primary" size="md" icon="shield" disabled={!valido} onClick={conferma}>Sospendi per {durata} giorni</AdmButton>
        </div>
      </div>
    </div>
  );
}

window.RESTRIZIONI = RESTRIZIONI;
window.RST_TIPI = RST_TIPI;
window.admRestrizioneViva = admRestrizioneViva;
window.admRestrizioneScaduta = admRestrizioneScaduta;
window.admTestoComunicazione = admTestoComunicazione;
window.SospensionePopup = SospensionePopup;
window.admRestrizioneAttiva = admRestrizioneAttiva;
window.admAggiungiRestrizione = admAggiungiRestrizione;
window.admRevocaRestrizione = admRevocaRestrizione;
window.admRevocaPerUtente = admRevocaPerUtente;
window.AdmRestrizioniModal = AdmRestrizioniModal;
