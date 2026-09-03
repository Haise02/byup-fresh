// Byup Staff — App shell, navigazione, bottom nav

const { useState: useStateA, useMemo: useMemoA, useEffect: useEffectA } = React;

function POSApp() {
  const [stack, setStack] = useStateA([{ s: 'login' }]);
  const [modal, setModal] = useStateA(null);
  const [contiPagati, setContiPagati] = useStateA([]);       // id dei conti già saldati
  const [contiRimandati, setContiRimandati] = useStateA([]); // id dei conti rimandati al gestionale
  const [contiRitirati, setContiRitirati] = useStateA([]);   // id dei conti ritirati dalla cassa
  const [toast, setToast] = useStateA(null);                 // banner transitorio { msg, id }
  const [faceIdOn, setFaceIdOn] = useStateA(false);          // sblocco con Face ID attivo
  const [faceIdAsked, setFaceIdAsked] = useStateA(false);    // primo accesso: attivazione già proposta?
  // La presa d'atto sulle statistiche di servizio (P-35 · D-30): l'evento
  // consent_events di tipo staff_metrics_notice, in memoria come faceIdAsked —
  // persiste nella sessione, si azzera al reload per ridimostrare il primo
  // accesso. In produzione lo scrive il server al primo login dell'operatore.
  const [consentEvents, setConsentEvents] = useStateA([]);
  const noticeDone = consentEvents.some(e => e.type === 'staff_metrics_notice');
  const registraNotice = () => setConsentEvents(l => [...l, {
    type: 'staff_metrics_notice', at: new Date().toISOString(),
    operatore: MERCHANT.operatore, superficie: 'byup-staff-pos',
  }]);

  const pagaConto = id => setContiPagati(p => p.includes(id) ? p : [...p, id]);
  const rimandaConto = id => setContiRimandati(p => p.includes(id) ? p : [...p, id]);
  const showToast = msg => setToast({ msg, id: Date.now() });

  // Terzo modo di uscire dalla coda, oltre a pagato e rimandato: la cassa
  // ritira il conto che aveva mandato. Arriva da fuori, non da un gesto
  // dell'operatore — in produzione dal server, qui dalla console per poterlo
  // provare: BYUP_STAFF_RITIRA('c_08').
  const ritiraConto = id => setContiRitirati(p => p.includes(id) ? p : [...p, id]);
  useEffectA(() => {
    window.BYUP_STAFF_RITIRA = ritiraConto;
    return () => { delete window.BYUP_STAFF_RITIRA; };
  }, []);

  const top = stack[stack.length - 1];

  // D-41 (P-53): la persona disattivata a sessione aperta. Ogni azione passa
  // di qui — nav e openModal — e se l'appartenenza attiva è stata spenta la
  // sessione si chiude sulla schermata che lo dice. Con ?disattiva=1 la
  // prima azione dopo l'ingresso spegne l'appartenenza, per poterla provare:
  // non il reset con cui si entra né il popup dei permessi che lo segue, ma
  // il primo gesto vero della persona. Il ref e i setter sono stabili, così
  // il nav memoizzato può usarli.
  const armato = React.useRef(DISATTIVA_DEMO);
  const revocata = (arma) => {
    if (!SESSIONE.membership_id) return false;
    if (arma && armato.current) { armato.current = false; staffDisattiva('owner_deactivated'); }
    if (!staffAccessoRevocato()) return false;
    const locale = MERCHANT.nome;
    staffEsci();
    setModal(null); setStack([{ s: 'disattivato', locale }]);
    return true;
  };

  const nav = useMemoA(() => ({
    push: s => { if (revocata(true)) return; setStack(p => [...p, s]); },
    pop: () => { if (revocata(true)) return; setStack(p => p.length > 1 ? p.slice(0, -1) : p); },
    replace: s => { if (revocata(true)) return; setStack(p => [...p.slice(0, -1), s]); },
    reset: s => { if (revocata(false)) return; setStack([s]); },
    setTab: tab => { if (revocata(true)) return; setStack([{ s: tab }]); },
  }), []);

  const openModal = m => { if (revocata(m && m.kind !== 'permessi')) return; setModal(m); };
  const closeModal = () => setModal(null);

  // L'ingresso in un ambiente: SESSIONE e MERCHANT si derivano
  // dall'appartenenza scelta, poi l'incasso e — se il Face ID non è attivo —
  // i permessi di primo accesso. Lo chiamano il login (un solo ambiente) e la
  // schermata locali (più d'uno).
  const apriPermessi = () => openModal({
    kind: 'permessi', noticeDone, markNotice: registraNotice,
    askFaceId: !faceIdAsked, enableFaceId: () => setFaceIdOn(true), markAsked: () => setFaceIdAsked(true),
  });
  const entraIn = (a) => { staffEntra(a); nav.reset({ s: 'incassa' }); if (!faceIdOn) apriPermessi(); };

  useEffectA(() => {
    const h = e => { if (e.key === 'Escape' && modal) closeModal(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [modal]);

  // Toast: si auto-chiude dopo qualche secondo
  useEffectA(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Sulle schermate di pagamento (full screen) la bottom nav è nascosta
  const hideNav = ['login', 'recupero', 'locali', 'disattivato', 'tap'].includes(top.s);
  const activeTab = ['transazioni'].includes(top.s) ? 'transazioni'
                  : ['profilo', 'password'].includes(top.s) ? 'profilo'
                  : 'incassa';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: ST.BG, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {top.s === 'login' && <ScreenLogin nav={nav} entraIn={entraIn} faceIdOn={faceIdOn}/>}
        {top.s === 'locali' && <ScreenLocali nav={nav} entraIn={entraIn}/>}
        {top.s === 'disattivato' && <ScreenDisattivato nav={nav} locale={top.locale}/>}
        {top.s === 'recupero' && <ScreenRecupero nav={nav}/>}
        {top.s === 'incassa' && <ScreenIncassa nav={nav} contiPagati={contiPagati} contiRimandati={contiRimandati} contiRitirati={contiRitirati}/>}
        {top.s === 'conto' && <ScreenConto nav={nav} conto={top.conto} ritirato={contiRitirati.includes(top.conto?.id)} rimandaConto={rimandaConto} openModal={openModal} showToast={showToast}/>}
        {top.s === 'tap' && <ScreenTap nav={nav} openModal={openModal} importo={top.importo} contoId={top.contoId} pagaConto={pagaConto}/>}
        {top.s === 'transazioni' && <ScreenTransazioni openModal={openModal}/>}
        {top.s === 'profilo' && <ScreenProfilo nav={nav} openModal={openModal} faceIdOn={faceIdOn} setFaceIdOn={setFaceIdOn}/>}
        {top.s === 'password' && <ScreenPassword nav={nav}/>}
      </div>

      {!hideNav && <BottomNav active={activeTab} setTab={nav.setTab}/>}

      {toast && <Toast msg={toast.msg} bottom={hideNav ? 30 : 96}/>}

      <POSModals modal={modal} closeModal={closeModal}/>
    </div>
  );
}

function BottomNav({ active, setTab }) {
  const items = [
    { id: 'transazioni', label: 'Transazioni', icon: I.Receipt },
    { id: 'incassa', label: 'Incassa', icon: I.Contactless },
    { id: 'profilo', label: 'Profilo', icon: I.Profile },
  ];
  return (
    <div style={{
      // Vetro, come la tab bar del cameriere: sta sopra contenuto che scorre,
      // quindi ha qualcosa da rifrangere. Il light-catch va in alto.
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: ST.GLASS_BAR.background,
      backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0) 100%)',
      backdropFilter: ST.GLASS_BAR.backdropFilter,
      WebkitBackdropFilter: ST.GLASS_BAR.WebkitBackdropFilter,
      boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.70)',
      borderTop: `1px solid ${ST.BORDER_SOFT}`, padding: '8px 8px 28px', display: 'flex',
    }}>
      {items.map(it => {
        const isA = active === it.id;
        const Ic = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            flex: 1, padding: '6px 4px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative',
          }}>
            <div style={{
              width: 44, height: 28, borderRadius: ST.R_PILL,
              background: isA ? ST.PINK_SOFT : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms',
            }}>
              <Ic s={20} c={isA ? ST.PINK_DARK : ST.MUTED}/>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: isA ? 700 : 600, color: isA ? ST.PINK_DARK : ST.MUTED }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Toast transitorio: comunica l'esito di un'azione (es. conto rimandato al gestionale)
function Toast({ msg, bottom = 96 }) {
  return (
    <div style={{
      position: 'absolute', bottom, left: 16, right: 16, zIndex: 60,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      animation: 'toastUp 220ms cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        background: ST.TEXT, color: '#fff', borderRadius: ST.R_PILL,
        padding: '11px 16px', fontSize: 13.5, fontWeight: 600, maxWidth: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
      }}>
        <I.Check s={16} c="#fff"/> {msg}
      </div>
      <style>{`@keyframes toastUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );
}

// Mount gestito da index.html (renderizza <POSApp/> dentro <IOSDevice/>)
