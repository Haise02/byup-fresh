// Desk 2.0 — Contatti · Locali (21 ottobre 2026)
//
// La rubrica è un elenco di persone e locali; questa è la stessa anagrafe
// vista come SCHEDE: un locale per scheda, con la foto, lo stato e i segnali
// che contano. Ogni locale è legato all'ACCOUNT del suo titolare, e un
// titolare può averne più d'uno (un gruppo di pizzerie, due trattorie nella
// stessa città).
//
// Oltre ad aprire la scheda, da qui si fa il lavoro che sulla rubrica costa
// cinque passaggi:
//   · DA GUARDARE PRIMA: l'ordine di default mette in cima chi ha bisogno di
//     noi — dormiente, fermo nell'avvio, ticket di priorità alta, addebito
//     fallito — e lo dice sulla scheda, in una riga;
//   · PER TITOLARE: la vista raggruppata mostra ogni account con i suoi
//     locali e quanto vale in tutto; da lì si aggiunge un locale all'account;
//   · SPOSTA A UN ALTRO TITOLARE: quando un locale cambia proprietario, o
//     quando un titolare apre il secondo locale e va riunito al suo account;
//   · i SEGNALI incrociati sulla scheda: ticket aperti, trattativa in corso in
//     Sales, condizioni speciali, vetrina;
//   · le AZIONI rapide: copia il telefono del titolare, crea un'attività con
//     Byuppino, apri le condizioni (prezzo, regali), apri una trattativa;
//   · la SELEZIONE multipla: crea un elenco statico (pubblico di una
//     campagna), assegna i locali a un titolare, crea un'attività per tutti.
//
// Prototipo: gli account dei titolari vivono qui (LC_STORE), in memoria.
// La scheda del locale legge da qui i «locali associati» del titolare.

const { useState: useStateLc, useEffect: useEffectLc, useMemo: useMemoLc } = React;

// ═══ Le foto ═══════════════════════════════════════════════════════════════
// Le stesse foto che l'app dei clienti usa già, per tipo di locale.
const LC_FOTO = {
  pizzeria:   ['1565299624946-b28f40a0ae38', '1513104890138-7c749659a591', '1574071318508-1cdbab80d002', '1604382354936-07c5d9983bd3'],
  ristorante: ['1414235077428-338989a2e8c0', '1517248135467-4c7edcad34c4', '1559339352-11d035aa65de', '1550966871-3ed3cdb5ed0c', '1555396273-367ea4eb4db5'],
  bistrot:    ['1555396273-367ea4eb4db5', '1517248135467-4c7edcad34c4', '1559339352-11d035aa65de'],
  enoteca:    ['1470337458703-46ad1756a187', '1544148103-0773bf10d330'],
  bar:        ['1501443762994-82bd5dace89a', '1470337458703-46ad1756a187'],
};
function lcFoto(l) {
  const lista = LC_FOTO[l.tipo] || LC_FOTO.ristorante;
  // Un seme dal nome, non dal codice: tre pizzerie dello stesso titolare con
  // codici vicini prendevano tutte la stessa foto.
  const n = typeof hubSeme === 'function' ? hubSeme('foto-' + l.nome) : l.nome.length;
  return 'https://images.unsplash.com/photo-' + lista[n % lista.length] + '?w=640&q=70&auto=format&fit=crop';
}

// ═══ Gli account dei titolari ══════════════════════════════════════════════
// Un account per locale, salvo i gruppi: lì più locali stanno sotto lo
// stesso account.
const LC_GRUPPI = [
  { nome: 'Chiara Greco',   locali: ['L1007', 'L1039', 'L1023'] },
  { nome: 'Luca Conti',     locali: ['L1028', 'L1012'] },
  { nome: 'Elena Russo',    locali: ['L1005', 'L1037'] },
  { nome: 'Sofia Esposito', locali: ['L1027', 'L1011'] },
  { nome: 'Giulia Bianchi', locali: ['L1017', 'L1041'] },
];
const LC_STORE = { account: null, ascolta: new Set(), conta: 0 };
function lcSlug(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, ''); }
function lcIniziali() {
  const acc = [];
  const preso = {};
  LC_GRUPPI.forEach((g, i) => {
    const primo = LOCALI.find(l => l.id === g.locali[0]);
    acc.push({ id: 'TIT-' + (100 + i), nome: g.nome, email: lcSlug(g.nome) + '@gruppo-' + lcSlug(primo ? primo.nome.split(' ').pop() : 'byup') + '.it', tel: primo ? primo.tel : '', locali: g.locali.slice() });
    g.locali.forEach(id => { preso[id] = true; const l = LOCALI.find(x => x.id === id); if (l) l.titolare = g.nome; });
  });
  LOCALI.forEach((l, i) => {
    if (preso[l.id]) return;
    acc.push({ id: 'TIT-' + (200 + i), nome: l.titolare, email: l.email, tel: l.tel, locali: [l.id] });
  });
  return acc;
}
function lcAccount() { if (!LC_STORE.account) LC_STORE.account = lcIniziali(); return LC_STORE.account; }
function lcScrivi(lista) { LC_STORE.account = lista; LC_STORE.ascolta.forEach(f => f()); }
function lcUsa() {
  const [, setN] = useStateLc(0);
  useEffectLc(() => { const f = () => setN(x => x + 1); LC_STORE.ascolta.add(f); return () => { LC_STORE.ascolta.delete(f); }; }, []);
  return lcAccount();
}
const lcAccountDi = (lid) => lcAccount().find(a => a.locali.includes(lid)) || null;
// Per la scheda del locale: gli altri locali dello stesso titolare.
function lcLocaliDelTitolare(l) {
  const a = lcAccountDi(l.id);
  const ids = a ? a.locali : [l.id];
  return ids.map(id => LOCALI.find(x => x.id === id)).filter(Boolean).map(x => ({ id: x.id, nome: x.nome, citta: x.citta }));
}
window.lcLocaliDelTitolare = lcLocaliDelTitolare;
// Spostare dei locali sotto un account (esistente o nuovo). Gli account
// rimasti senza locali spariscono: un titolare senza locali non è un cliente.
function lcSposta(lids, versoId, nuovo) {
  const prima = lcAccount().map(a => Object.assign({}, a, { locali: a.locali.slice() }));
  const titPrima = {}; lids.forEach(id => { const l = LOCALI.find(x => x.id === id); if (l) titPrima[id] = l.titolare; });
  let lista = lcAccount().map(a => Object.assign({}, a, { locali: a.locali.filter(id => !lids.includes(id)) }));
  let dest;
  if (nuovo) { LC_STORE.conta += 1; dest = { id: 'TIT-N' + LC_STORE.conta, nome: nuovo.nome, email: nuovo.email, tel: nuovo.tel || '', locali: [] }; lista.push(dest); }
  else dest = lista.find(a => a.id === versoId);
  dest.locali = dest.locali.concat(lids);
  lista = lista.filter(a => a.locali.length);
  lids.forEach(id => { const l = LOCALI.find(x => x.id === id); if (l) l.titolare = dest.nome; });
  lcScrivi(lista);
  return { dest, annulla: () => { lcScrivi(prima); Object.keys(titPrima).forEach(id => { const l = LOCALI.find(x => x.id === id); if (l) l.titolare = titPrima[id]; }); } };
}

// ═══ I segnali ═════════════════════════════════════════════════════════════
const LC_STATI = {
  registered: { t: 'Iscritto',  bg: '#DCBAD7', fg: '#492844' },
  onboarding: { t: 'In avvio',  bg: '#F6E3B0', fg: '#5A4512' },
  active:     { t: 'Attivo',    bg: '#D9F0E3', fg: '#1F5A43' },
  dormant:    { t: 'Dormiente', bg: '#FFE0E8', fg: '#C40B45' },
  churned:    { t: 'Perso',     bg: '#E9E4E6', fg: '#4A4048' },
};
const lcGiorni = (d) => d ? Math.round((Date.now() - new Date(d).getTime()) / 864e5) : null;
function lcSegnali(l) {
  const tk = (typeof COMUNICAZIONI !== 'undefined' ? COMUNICAZIONI : []).filter(c => c.localeId === l.id && (c.stato === 'nuova' || c.stato === 'in_corso'));
  const tr = typeof slLeggi === 'function' ? slLeggi().find(t => t.localeId === l.id && ['contatto', 'demo', 'proposta', 'trattativa'].includes(t.fase)) : null;
  const vet = typeof vetAttiva === 'function' ? vetAttiva(l) : null;
  const cond = typeof condRiassunto === 'function' ? condRiassunto(l) : null;
  // Perché guardarlo, in una riga, e quanto pesa.
  let motivo = null, peso = 0;
  if (l.pagamentoFallito) { motivo = 'Addebito fallito: ' + l.pagamentoFallito.motivo; peso = 5; }
  else if (tk.some(c => c.priorita === 'alta')) { motivo = 'Ticket di priorità alta aperto'; peso = 4; }
  else if (l.stato === 'dormant') { motivo = 'Non entra da ' + lcGiorni(l.lastLogin) + ' giorni'; peso = 3; }
  else if (l.stato === 'onboarding' && l.stoppedAt) { motivo = 'Fermo nell\'avvio' + (l.stoppedSub ? ' su ' + l.stoppedSub : '') + ' · ' + (l.completedSteps || []).length + ' passi fatti'; peso = 2; }
  else if (l.stato === 'registered') { motivo = 'Iscritto, non ha ancora iniziato la configurazione'; peso = 1; }
  return { tk, tr, vet, cond, motivo, peso };
}

// ═══ La scheda ═════════════════════════════════════════════════════════════
function LcAzione({ icona, title, onClick, scura }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={title} aria-label={title} className="lc-azione" style={{
      width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(73,40,68,0.10)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
      background: scura ? ADM.INCHIOSTRO : '#fff', color: scura ? '#fff' : ADM.TEXT,
    }}>{React.createElement(BuIcons[icona], { size: 15 })}</button>
  );
}

function LcScheda({ l, sel, selezione, onSel, onApri, onSposta, account, compatta }) {
  const s = lcSegnali(l);
  const st = LC_STATI[l.stato] || LC_STATI.active;
  const piano = (PIANI.find(p => p.id === l.piano) || { label: l.piano });
  const [foto, setFoto] = useStateLc(true);
  const altri = account ? account.locali.length - 1 : 0;
  const copia = () => {
    try { navigator.clipboard.writeText(l.tel); } catch (e) {}
    if (window.deskAvviso) window.deskAvviso({ testo: 'Copiato ' + l.tel + ' · ' + l.titolare });
  };
  return (
    <div onClick={() => selezione ? onSel(l.id) : onApri(l)} className="lc-scheda" style={{
      borderRadius: 24, overflow: 'hidden', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', minWidth: 0,
      boxShadow: sel ? '0 0 0 3px ' + ADM.INCHIOSTRO + ', 0 18px 34px -22px rgba(73,40,68,0.6)' : '0 1px 0 rgba(255,255,255,0.8) inset, 0 14px 30px -22px rgba(73,40,68,0.55)',
      border: '1px solid rgba(73,40,68,0.06)',
    }}>
      <div style={{ position: 'relative', height: compatta ? 116 : 148, background: 'linear-gradient(140deg, #DCBAD7, #492844)' }}>
        {foto && <img src={lcFoto(l)} alt="" loading="lazy" onError={() => setFoto(false)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(29,21,32,0.0) 40%, rgba(29,21,32,0.55) 100%)' }}/>
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          {selezione && (
            <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', background: sel ? ADM.INCHIOSTRO : 'rgba(255,255,255,0.9)', border: sel ? 'none' : '2px solid rgba(73,40,68,0.3)', color: '#fff' }}>
              {sel && <BuIcons.check size={13} strokeWidth={3}/>}
            </span>
          )}
          <span style={{ fontSize: 11.6, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: st.bg, color: st.fg }}>{st.t}</span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 11.6, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.92)', color: ADM.TEXT }}>{piano.label}</span>
        </div>
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 10, color: '#fff' }}>
          <div style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-0.025em', lineHeight: 1.15, textShadow: '0 1px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.nome}</div>
          <div style={{ fontSize: 12, opacity: 0.88, marginTop: 2 }}>{admTipoLabel(l.tipo)} · {l.citta}</div>
        </div>
      </div>

      <div style={{ padding: '12px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Il titolare, con l'account e gli altri locali */}
        {!compatta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <AdmAvatar name={l.titolare} size={30}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.2, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.titolare}</div>
              <div style={{ fontSize: 11.6, color: ADM.MUTED }}>Titolare{altri > 0 ? ' · ' : ''}{altri > 0 && <b style={{ color: ADM.DESK_PRUGNA }}>+{altri} {altri === 1 ? 'altro locale' : 'altri locali'}</b>}</div>
            </div>
          </div>
        )}

        {/* I numeri */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, padding: '9px 10px', borderRadius: 14, background: '#F7F2F4' }}>
          {[
            [l.ordiniMese ? fmtNum(l.ordiniMese) : '—', 'ordini/mese'],
            [l.mrr ? '€ ' + Math.round(l.mrr) : '€ 0', 'al mese'],
            [lcGiorni(l.lastLogin) === 0 ? 'oggi' : lcGiorni(l.lastLogin) != null ? lcGiorni(l.lastLogin) + ' gg' : '—', 'ultimo accesso'],
          ].map((x, i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.6, fontWeight: 750, letterSpacing: '-0.02em' }}>{x[0]}</div>
              <div style={{ fontSize: 10.8, color: ADM.MUTED, fontWeight: 600 }}>{x[1]}</div>
            </div>
          ))}
        </div>

        {/* Perché guardarlo, e i segnali */}
        {s.motivo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 12, background: s.peso >= 3 ? '#FFE8EE' : '#FAF1DC', color: s.peso >= 3 ? '#C40B45' : '#7A5A12', fontSize: 12.2, fontWeight: 700 }}>
            <BuIcons.alertTriangle size={13}/><span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.motivo}</span>
          </div>
        )}
        {(s.tk.length > 0 || s.tr || s.cond || s.vet) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {s.tk.length > 0 && <span className="lc-segnale"><BuIcons.ticket size={12}/>{s.tk.length} ticket</span>}
            {s.tr && <span className="lc-segnale" style={{ background: '#E4F2EA', color: '#1F5A43' }}><BuIcons.target size={12}/>Sales · {({ contatto: 'primo contatto', demo: 'demo', proposta: 'proposta', trattativa: 'trattativa' })[s.tr.fase]}</span>}
            {s.cond && <span className="lc-segnale" style={{ background: '#F4EAF2', color: '#492844' }}><BuIcons.crown size={12}/>{s.cond}</span>}
            {s.vet && <span className="lc-segnale" style={{ background: '#FFF1D6', color: '#7A5A12' }}><BuIcons.star size={12}/>Vetrina</span>}
          </div>
        )}
        <div style={{ flex: 1 }}/>

        {/* Le azioni */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LcAzione icona="phone" title={'Copia il telefono di ' + l.titolare + ' · ' + l.tel} onClick={copia}/>
          <LcAzione icona="checkSquare" title="Crea un'attività con Byuppino" onClick={() => window.byuppinoApri && window.byuppinoApri('Crea un\'attività: richiamare ' + l.nome + ' ')}/>
          <LcAzione icona="crown" title="Condizioni e vantaggi: prezzo, promozioni, regali" onClick={() => window.hubVai && window.hubVai('locali', { openLocale: l, tab: 'condizioni' })}/>
          {!s.tr && <LcAzione icona="target" title="Apri una trattativa in Sales" onClick={() => window.byuppinoApri && window.byuppinoApri('Apri una trattativa con ' + l.nome + ', piano ' + (l.piano === 'free' ? 'Starter' : l.piano === 'starter' ? 'Plus' : 'Business'), true)}/>}
          <LcAzione icona="users" title="Sposta a un altro titolare" onClick={() => onSposta([l.id])}/>
          <span style={{ flex: 1 }}/>
          {compatta
            ? <BuIcons.arrowRight size={15}/>
            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.4, fontWeight: 750, color: ADM.TEXT }}>Scheda <BuIcons.arrowRight size={13}/></span>}
        </div>
      </div>
    </div>
  );
}

// ═══ Sposta a un altro titolare ════════════════════════════════════════════
function LcSposta({ lids, onClose }) {
  const acc = lcUsa();
  const [cerca, setCerca] = useStateLc('');
  const [scelto, setScelto] = useStateLc(null);
  const [nuovo, setNuovo] = useStateLc(false);
  const [nome, setNome] = useStateLc('');
  const [email, setEmail] = useStateLc('');
  useEffectLc(() => { setScelto(null); setNuovo(false); setCerca(''); setNome(''); setEmail(''); }, [lids && lids.join()]);
  if (!lids) return null;
  const locali = lids.map(id => LOCALI.find(l => l.id === id)).filter(Boolean);
  const attuali = Array.from(new Set(lids.map(id => (lcAccountDi(id) || {}).id)));
  const q = cerca.trim().toLowerCase();
  const lista = acc.filter(a => !(attuali.length === 1 && a.id === attuali[0])).filter(a => !q || (a.nome + ' ' + a.email + ' ' + a.locali.map(id => (LOCALI.find(l => l.id === id) || {}).nome).join(' ')).toLowerCase().includes(q)).slice(0, 30);
  const ok = nuovo ? nome.trim() && /@/.test(email) : !!scelto;
  const conferma = () => {
    const esito = lcSposta(lids, scelto, nuovo ? { nome: nome.trim(), email: email.trim() } : null);
    if (window.deskAvviso) window.deskAvviso({ testo: (lids.length === 1 ? locali[0].nome : lids.length + ' locali') + ' → ' + esito.dest.nome, annulla: esito.annulla });
    onClose();
  };
  return (
    <HubModale open={true} onClose={onClose} larghezza={560} titolo={lids.length === 1 ? 'Sposta ' + locali[0].nome : 'Assegna ' + lids.length + ' locali'}
      sotto="Sotto quale account di titolare va? Chi accede con quell'account vedrà il locale nel suo gestionale; il titolare di prima non lo vedrà più."
      footer={<React.Fragment><div style={{ flex: 1 }}/><AdmButton variant="ghost" size="md" onClick={onClose}>Annulla</AdmButton><AdmButton variant="primary" size="md" icon="check" disabled={!ok} onClick={conferma}>Sposta</AdmButton></React.Fragment>}>
      <HubSegmenti attivo={nuovo ? 'nuovo' : 'esistente'} onCambia={(v) => setNuovo(v === 'nuovo')} voci={[{ id: 'esistente', label: 'Titolare esistente' }, { id: 'nuovo', label: 'Nuovo titolare' }]}/>
      {nuovo ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          <HubCampo label="Nome e cognome"><HubInput valore={nome} onCambia={setNome} placeholder="Es. Daniele Bonelli" autoFocus/></HubCampo>
          <HubCampo label="Email dell'account" nota="Riceve l'invito ad accedere."><HubInput valore={email} onCambia={setEmail} placeholder="nome@locale.it"/></HubCampo>
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca per nome, email o locale…" larghezza="100%"/>
          <div className="hub-scroll" style={{ maxHeight: 300, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lista.map(a => {
              const on = scelto === a.id;
              return (
                <button key={a.id} onClick={() => setScelto(a.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  border: '1.5px solid ' + (on ? ADM.INCHIOSTRO : 'transparent'), background: on ? '#fff' : 'rgba(255,255,255,0.6)',
                }}>
                  <AdmAvatar name={a.nome} size={32}/>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700 }}>{a.nome}</span>
                    <span style={{ display: 'block', fontSize: 11.8, color: ADM.MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.email} · {a.locali.map(id => (LOCALI.find(l => l.id === id) || {}).nome).join(', ')}</span>
                  </span>
                  <span style={{ fontSize: 11.6, fontWeight: 750, color: ADM.MUTED }}>{a.locali.length} {a.locali.length === 1 ? 'locale' : 'locali'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </HubModale>
  );
}

// ═══ La pagina ═════════════════════════════════════════════════════════════
const LC_ORDINI = [
  { value: 'guardare', label: 'Da guardare prima' },
  { value: 'nome',     label: 'Nome' },
  { value: 'ordini',   label: 'Più ordini' },
  { value: 'valore',   label: 'Più valore' },
];
const LC_FILTRI_STATO = [
  { id: 'tutti', label: 'Tutti' },
  { id: 'guardare', label: 'Da guardare' },
  { id: 'active', label: 'Attivi' },
  { id: 'onboarding', label: 'In avvio' },
  { id: 'dormant', label: 'Dormienti' },
];

function DeskLocaliPage() {
  const account = lcUsa();
  if (typeof slLeggi === 'function' && typeof slUsaStore === 'function') slUsaStore();
  const [vista, setVista] = useStateLc('schede');
  const [stato, setStato] = useStateLc('tutti');
  const [piano, setPiano] = useStateLc('tutti');
  const [citta, setCitta] = useStateLc('tutte');
  const [ordine, setOrdine] = useStateLc('guardare');
  const [cerca, setCerca] = useStateLc('');
  const [selezione, setSelezione] = useStateLc(false);
  const [scelti, setScelti] = useStateLc([]);
  const [sposta, setSposta] = useStateLc(null);
  const [aggiungiA, setAggiungiA] = useStateLc(null);

  const segnali = useMemoLc(() => { const m = {}; LOCALI.forEach(l => { m[l.id] = lcSegnali(l); }); return m; }, [account, stato]);
  const cittaTutte = Array.from(new Set(LOCALI.map(l => l.citta))).sort();
  const q = cerca.trim().toLowerCase();
  const filtrati = LOCALI.filter(l =>
    (stato === 'tutti' || (stato === 'guardare' ? segnali[l.id].peso > 0 : l.stato === stato)) &&
    (piano === 'tutti' || l.piano === piano) && (citta === 'tutte' || l.citta === citta) &&
    (!q || (l.nome + ' ' + l.citta + ' ' + l.titolare + ' ' + l.id).toLowerCase().includes(q))
  ).sort((a, b) => ordine === 'nome' ? a.nome.localeCompare(b.nome)
    : ordine === 'ordini' ? (b.ordiniMese || 0) - (a.ordiniMese || 0)
    : ordine === 'valore' ? (b.mrr || 0) - (a.mrr || 0)
    : (segnali[b.id].peso - segnali[a.id].peso) || a.nome.localeCompare(b.nome));
  const daGuardare = LOCALI.filter(l => segnali[l.id].peso > 0).length;
  const multi = account.filter(a => a.locali.length > 1).length;
  const tocca = (id) => setScelti(s => s.includes(id) ? s.filter(x => x !== id) : s.concat([id]));
  const apri = (l) => window.hubVai && window.hubVai('locali', { openLocale: l });
  const fineSelezione = () => { setSelezione(false); setScelti([]); };

  const creaElenco = () => {
    if (typeof HUB_ELENCHI === 'undefined') return;
    const id = 'EL-' + String(100 + HUB_ELENCHI.length).padStart(3, '0');
    HUB_ELENCHI.unshift({ id, nome: 'Locali scelti a mano · ' + new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }), tipo: 'statico', scopo: 'Servizio',
      descrizione: scelti.map(x => (LOCALI.find(l => l.id === x) || {}).nome).join(', '), autore: 'Marco Rinaldi', creato: new Date(), aggiornato: new Date(),
      usatoIn: [], origine: 'Selezionati dalla vista Locali', membriFissi: scelti.length, includi: [], escludi: [] });
    if (window.deskAvviso) window.deskAvviso({ testo: 'Elenco ' + id + ' creato con ' + scelti.length + ' locali', annulla: () => { const i = HUB_ELENCHI.findIndex(e => e.id === id); if (i >= 0) HUB_ELENCHI.splice(i, 1); } });
    fineSelezione();
  };

  const gruppi = vista === 'titolari'
    ? account.map(a => Object.assign({}, a, { mieLocali: a.locali.map(id => filtrati.find(l => l.id === id)).filter(Boolean) }))
        .filter(a => a.mieLocali.length).sort((a, b) => (b.locali.length - a.locali.length) || a.nome.localeCompare(b.nome))
    : null;

  return (
    <div style={{ padding: '22px 28px 110px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{LC_CSS}</style>
      <HubTestata titolo="Locali"
        sotto={'Ogni locale è legato all\'account del suo titolare, e un titolare può averne più d\'uno. ' + LOCALI.length + ' locali, ' + account.length + ' titolari, ' + multi + ' con più locali.'}
        azioni={<React.Fragment>
          <HubStrumento icona="checkSquare" acceso={selezione} onClick={() => selezione ? fineSelezione() : setSelezione(true)}>{selezione ? 'Fine selezione' : 'Seleziona'}</HubStrumento>
        </React.Fragment>}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <HubSegmenti attivo={vista} onCambia={setVista} voci={[{ id: 'schede', label: 'Schede' }, { id: 'titolari', label: 'Per titolare', conteggio: multi }]}/>
        <HubSegmenti attivo={stato} onCambia={setStato} voci={LC_FILTRI_STATO.map(f => f.id === 'guardare' ? Object.assign({}, f, { conteggio: daGuardare }) : f)}/>
        <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Locale, città, titolare…" larghezza={230}/>
        <div style={{ flex: 1 }}/>
        <AdmSelect value={piano} onChange={setPiano} align="right" options={[{ value: 'tutti', label: 'Tutti i piani' }].concat(PIANI.map(p => ({ value: p.id, label: p.label })))}/>
        <AdmSelect value={citta} onChange={setCitta} align="right" maxHeight={300} options={[{ value: 'tutte', label: 'Tutte le città' }].concat(cittaTutte.map(c => ({ value: c, label: c })))}/>
        <AdmSelect value={ordine} onChange={setOrdine} align="right" options={LC_ORDINI}/>
      </div>

      {filtrati.length === 0 && <AdmCard padding={0}><HubVuoto icona="store" titolo="Nessun locale" desc="Prova a togliere un filtro o a cercare in un altro modo."/></AdmCard>}

      {vista === 'schede' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {filtrati.map(l => <LcScheda key={l.id} l={l} account={lcAccountDi(l.id)} selezione={selezione} sel={scelti.includes(l.id)} onSel={tocca} onApri={apri} onSposta={setSposta}/>)}
        </div>
      )}

      {vista === 'titolari' && gruppi.map(a => {
        const tutti = a.locali.map(id => LOCALI.find(l => l.id === id)).filter(Boolean);
        const valore = tutti.reduce((s, l) => s + (l.mrr || 0), 0);
        const ordini = tutti.reduce((s, l) => s + (l.ordiniMese || 0), 0);
        return (
          <AdmCard key={a.id} padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <AdmAvatar name={a.nome} size={42}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-0.02em' }}>{a.nome}</span>
                  <span style={{ fontSize: 11.6, fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: a.locali.length > 1 ? '#F4EAF2' : '#F3EEF0', color: a.locali.length > 1 ? '#492844' : ADM.MUTED }}>{a.locali.length} {a.locali.length === 1 ? 'locale' : 'locali'}</span>
                </div>
                <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 2 }}>{a.email}{a.tel ? ' · ' + a.tel : ''} · account {a.id}</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 750, letterSpacing: '-0.03em' }}>€ {Math.round(valore)}<span style={{ fontSize: 12, color: ADM.MUTED, fontWeight: 600 }}>/mese</span></div>
                <div style={{ fontSize: 11.8, color: ADM.MUTED }}>{fmtNum(ordini)} ordini al mese in tutto</div>
              </div>
              <HubStrumento icona="plus" onClick={() => setAggiungiA(a.id)}>Aggiungi locale</HubStrumento>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {a.mieLocali.map(l => <LcScheda key={l.id} l={l} account={a} compatta selezione={selezione} sel={scelti.includes(l.id)} onSel={tocca} onApri={apri} onSposta={setSposta}/>)}
            </div>
          </AdmCard>
        );
      })}

      {/* La barra della selezione */}
      {selezione && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 84, transform: 'translateX(-50%)', zIndex: 80, display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 8px 8px 18px', borderRadius: 999, background: ADM.INCHIOSTRO, color: '#fff', boxShadow: '0 24px 50px -18px rgba(29,21,32,0.7)', animation: 'deskAvvisoIn 0.25s ease',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, marginRight: 6, whiteSpace: 'nowrap' }}>{scelti.length ? scelti.length + (scelti.length === 1 ? ' locale' : ' locali') : 'Tocca le schede da scegliere'}</span>
          <button className="lc-bulk" disabled={!filtrati.length} onClick={() => setScelti(scelti.length === filtrati.length ? [] : filtrati.map(l => l.id))}>{scelti.length === filtrati.length && filtrati.length ? 'Nessuno' : 'Tutti'}</button>
          <button className="lc-bulk" disabled={!scelti.length} onClick={creaElenco}><BuIcons.list size={14}/>Crea elenco</button>
          <button className="lc-bulk" disabled={!scelti.length} onClick={() => setSposta(scelti.slice())}><BuIcons.users size={14}/>Assegna a un titolare</button>
          <button className="lc-bulk" disabled={!scelti.length} onClick={() => { const nomi = scelti.map(x => (LOCALI.find(l => l.id === x) || {}).nome); window.byuppinoApri && window.byuppinoApri('Crea un\'attività: richiamare ' + nomi.join(', ') + ' '); }}><BuIcons.checkSquare size={14}/>Attività</button>
          <button className="lc-bulk" onClick={fineSelezione} style={{ background: 'transparent' }}>Annulla</button>
        </div>
      )}

      {sposta && <LcSposta lids={sposta} onClose={() => { setSposta(null); fineSelezione(); }}/>}
      {aggiungiA && <LcAggiungi accountId={aggiungiA} onClose={() => setAggiungiA(null)}/>}
    </div>
  );
}

// Aggiungere un locale a un account: si sceglie fra quelli di altri titolari.
function LcAggiungi({ accountId, onClose }) {
  const acc = lcUsa();
  const a = acc.find(x => x.id === accountId);
  const [cerca, setCerca] = useStateLc('');
  const [scelto, setScelto] = useStateLc(null);
  if (!a) return null;
  const q = cerca.trim().toLowerCase();
  const lista = LOCALI.filter(l => !a.locali.includes(l.id) && (!q || (l.nome + ' ' + l.citta + ' ' + l.titolare).toLowerCase().includes(q))).slice(0, 40);
  return (
    <HubModale open={true} onClose={onClose} larghezza={560} titolo={'Aggiungi un locale a ' + a.nome}
      sotto="Il locale passa sotto questo account: il titolare lo trova nel suo gestionale insieme agli altri."
      footer={<React.Fragment><div style={{ flex: 1 }}/><AdmButton variant="ghost" size="md" onClick={onClose}>Annulla</AdmButton><AdmButton variant="primary" size="md" icon="plus" disabled={!scelto} onClick={() => {
        const l = LOCALI.find(x => x.id === scelto);
        const e = lcSposta([scelto], a.id);
        if (window.deskAvviso) window.deskAvviso({ testo: l.nome + ' → ' + a.nome, annulla: e.annulla });
        onClose();
      }}>Aggiungi</AdmButton></React.Fragment>}>
      <HubRicerca valore={cerca} onCambia={setCerca} placeholder="Cerca un locale…" larghezza="100%"/>
      <div className="hub-scroll" style={{ maxHeight: 320, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lista.map(l => {
          const on = scelto === l.id;
          return (
            <button key={l.id} onClick={() => setScelto(l.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              border: '1.5px solid ' + (on ? ADM.INCHIOSTRO : 'transparent'), background: on ? '#fff' : 'rgba(255,255,255,0.6)',
            }}>
              <img src={lcFoto(l)} alt="" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', background: '#DCBAD7' }}/>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.4, fontWeight: 700 }}>{l.nome}</span>
                <span style={{ display: 'block', fontSize: 11.8, color: ADM.MUTED }}>{l.citta} · oggi di {l.titolare}</span>
              </span>
            </button>
          );
        })}
      </div>
    </HubModale>
  );
}

const LC_CSS = `
.lc-scheda { transition: transform 0.18s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.18s ease; }
.lc-scheda:hover { transform: translateY(-3px); }
.lc-scheda:hover img { transform: scale(1.04); }
.lc-scheda img { transition: transform 0.4s ease; }
.lc-azione { transition: background 0.12s ease, transform 0.12s ease; }
.lc-azione:hover { background: #F3EEF0 !important; transform: translateY(-1px); }
.lc-segnale { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; background: #EAF0FB; color: #2552B5; font-size: 11.6px; font-weight: 750; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.lc-bulk { display: inline-flex; align-items: center; gap: 6px; padding: 8px 13px; border-radius: 999px; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 700; background: rgba(255,255,255,0.12); color: #fff; white-space: nowrap; }
.lc-bulk:hover:not(:disabled) { background: rgba(255,255,255,0.22); }
.lc-bulk:disabled { opacity: 0.4; cursor: default; }
`;

window.DeskLocaliPage = DeskLocaliPage;
window.lcAccount = lcAccount;
