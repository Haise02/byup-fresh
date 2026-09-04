// Top-level app

// Layout default — solo l'ORDINE dei widget: le misure sono fisse e vivono
// nel catalogo (PN_WIDGET_CATALOG[].size), pensate per il dato che mostrano.
// Il TETRIS È RISOLTO PER QUATTRO COLONNE: con l'assistente raddoppiato
// (2×4, ancorato a destra) la dashboard vive da schermo largo, e le 32 celle
// fanno un rettangolo 4×8 esatto, zero buchi:
//   riga  1:    incassi 2×1                  · byuppino ↓ (2 colonne)
//   righe 2-3:  tavoli-stato 2×2             · byuppino ↓
//   righe 4-5:  recensioni 1×2 · cucina 1×2  · byuppino ↓ (fino a riga 4)
//                                            · pren 1×2 · top-piatti 1×2 (r5-6)
//   riga  6:    scontrino 2×1                · pren/top ↓
//   righe 7-8:  riempimento 2×2              · coperti-sett 2×2
// L'ORDINE di questa lista è l'incastro: spostare una tessera sposta i vuoti —
// il dense tappa quel che può, ma l'aritmetica delle aree la decide la lista.
// A tre colonne (finestra più stretta) il rettangolo non chiude: l'assistente
// prende due colonne su tre, di fianco gli resta la colonna singola con
// Recensioni e Cucina, e Incassi + Stato tavoli scendono sotto. La card
// «Coperti» (sparkline) resta fuori dal default — i coperti li racconta già
// lo spaccato settimanale — ma vive nel catalogo per chi la vuole.
const DEFAULT_LAYOUT = [
  { id: 'byuppino' },
  { id: 'incassi' },
  { id: 'tavoli-stato' },
  { id: 'recensioni' },
  { id: 'cucina-live' },
  { id: 'prenotazioni-oggi' },
  { id: 'notifiche' },
  { id: 'top-piatti' },
  { id: 'andamento-scontrino' },
  { id: 'riempimento' },
  { id: 'coperti-sett' },
];

// Gli id storici dei layout salvati migrano sui widget nuovi.
const PN_ID_MIGRATE = {
  // Le Azioni rapide non ci sono più: chi ha una dashboard salvata se le
  // ritrova sostituite dall'assistente, che comunque è fisso e torna in testa.
  'azioni': 'byuppino',
  'financials': 'andamento-coperti',
  'kpi-vendita': 'andamento-scontrino',
  'scontrino-medio': 'andamento-scontrino',
  'coperti-medi': 'andamento-coperti',
};

// Layout persistito: le modifiche salvate (Fine / "Salva ed esci") e i drag
// fuori dall'edit mode sopravvivono al cambio pagina via localStorage.
// Dei layout salvati prima delle misure fisse si conserva solo l'ordine.
const PN_LAYOUT_KEY = 'byup_dashboard_layout';
function pnLoadLayout() {
  try {
    const raw = localStorage.getItem(PN_LAYOUT_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length && arr.every(w => w && w.id)) {
        let ids = arr.map(w => PN_ID_MIGRATE[w.id] || w.id);
        ids = ids.filter((id, i) => ids.indexOf(id) === i);
        // I fissi tornano in testa comunque: nei layout salvati prima che
        // esistessero non ci sono, e in quelli salvati dopo potrebbero essere
        // finiti altrove. Qui si rimette la regola, una volta per tutte.
        ids = PN_WIDGET_FISSI.concat(ids.filter(id => !pnFisso(id)));
        if (ids.includes('andamento-coperti') && !ids.includes('andamento-scontrino')) {
          ids.splice(ids.indexOf('andamento-coperti') + 1, 0, 'andamento-scontrino');
        }
        return ids.map(id => ({ id }));
      }
    }
  } catch (e) {}
  return DEFAULT_LAYOUT;
}
function pnSaveLayout(ws) {
  try { localStorage.setItem(PN_LAYOUT_KEY, JSON.stringify(ws)); } catch (e) {}
}

function PnApp() {
  const [editMode, setEditMode] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [widgets, setWidgets] = React.useState(pnLoadLayout);
  // Snapshot del layout all'ingresso in edit mode: serve per "Annulla modifiche".
  const savedRef = React.useRef(null);
  // URL in attesa quando si tenta di cambiare schermata con modifiche non salvate.
  const [navConfirm, setNavConfirm] = React.useState(null);

  const dirty = editMode && savedRef.current !== null
    && JSON.stringify(savedRef.current) !== JSON.stringify(widgets);

  const toggleEdit = () => {
    if (!editMode) {
      savedRef.current = widgets;
      setEditMode(true);
    } else {
      pnSaveLayout(widgets); // "Fine" = salva
      savedRef.current = null;
      setEditMode(false);
    }
  };

  const remove = (id) => {
    if (pnFisso(id)) return;
    setWidgets(ws => ws.filter(w => w.id !== id));
  };
  const add = (id) => {
    const def = PN_WIDGET_CATALOG.find(c => c.id === id);
    if (!def) return;
    setWidgets(ws => [...ws, { id }]);
    setDrawerOpen(false);
  };
  const reorder = (fromId, toId) => {
    // Né si sposta, né gli si scambia il posto: l'assistente resta il primo.
    if (pnFisso(fromId) || pnFisso(toId)) return;
    setWidgets(ws => {
      const fromIdx = ws.findIndex(w => w.id === fromId);
      const toIdx = ws.findIndex(w => w.id === toId);
      if (fromIdx < 0 || toIdx < 0) return ws;
      const next = [...ws];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      // Drag fuori da Personalizza: la nuova disposizione si salva subito.
      // In edit mode invece si salva solo con Fine / "Salva ed esci".
      if (!editMode) pnSaveLayout(next);
      return next;
    });
  };

  // Navigazione dalla sidebar: se ci sono modifiche non salvate, chiedi prima.
  const handleNav = (id) => {
    const url = PN_PAGES[id];
    if (!url) return;
    if (dirty) { setNavConfirm(url); return; }
    window.location.href = url;
  };

  const device = window.PnDevice ? window.PnDevice.use() : 'desktop';

  // Il popup «modifiche non salvate» serve a entrambe le vesti.
  const popupNavConfirm = navConfirm && (
    <div onClick={() => setNavConfirm(null)} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', zIndex: 300, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20, width: 420, maxWidth:'100%',
        padding: '22px 22px 20px',
        display:'flex', flexDirection:'column', gap: 16,
      }}>
        <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: PN.PINK_SOFT, color: PN.PINK_DARK,
            display:'grid', placeItems:'center',
          }}>
            <Icon name="pencil" size={18}/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Modifiche non salvate</div>
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
              Hai personalizzato la dashboard. Vuoi salvare le modifiche prima di uscire?
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap: 8}}>
          <button
            onClick={() => { window.location.href = navConfirm; }}
            style={{
              flex: 1, padding: '11px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
              border: '1px solid rgba(15,17,21,0.12)',
              fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            }}>
            Annulla modifiche
          </button>
          <button
            onClick={() => { pnSaveLayout(widgets); window.location.href = navConfirm; }}
            style={{
              flex: 1, padding: '11px 14px', borderRadius: 999,
              background: PN.BTN_DARK, color: PN.WHITE,
              border: '1px solid rgba(0,0,0,0.32)',
              fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            }}>
            Salva ed esci
          </button>
        </div>
        <button
          onClick={() => setNavConfirm(null)}
          style={{
            border:'none', background:'transparent', padding: 0,
            fontSize: 13.5, fontWeight: 600, color: PN.MUTED,
            cursor:'pointer', fontFamily:'inherit',
          }}>
          Continua a modificare
        </button>
      </div>
    </div>
  );

  // ── Telefono: shell a due tab, widget impilati dalla griglia (che sotto i
  // 620px va da sola a una colonna). Il byuppino passa IN CODA: al telefono
  // prima i numeri, la chat si raggiunge scorrendo. La card del piano — che
  // sul desktop vive in sidebar — qui apre la pagina: il risparmio delle
  // transazioni pesate deve restare visibile anche dal telefono.
  if (device === 'phone') {
    const mobileWidgets = [
      ...widgets.filter(w => !pnFisso(w.id)),
      ...widgets.filter(w => pnFisso(w.id)),
    ];
    return (
      <React.Fragment>
        <PnMobileShell active="panoramica" title="Panoramica" onNav={handleNav}
          actions={
            <button onClick={toggleEdit} title={editMode ? 'Salva' : 'Personalizza'} style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'8px 13px', borderRadius: 999,
              background: editMode ? PN.PINK : PN.WHITE,
              color: editMode ? PN.WHITE : PN.TEXT,
              border: `1px solid ${editMode ? PN.PINK : PN.BORDER}`,
              fontWeight: 700, fontSize: 13.5, fontFamily:'inherit', cursor:'pointer',
              flexShrink: 0,
            }}>
              <Icon name={editMode ? 'check' : 'pencil'} size={13}/>
              {editMode ? 'Salva' : 'Personalizza'}
            </button>
          }>
          <div style={{padding:'14px 14px 24px', display:'flex', flexDirection:'column', gap: 14}}>
            <PnSidebarPlanCard/>
            {editMode && (
              <div style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'10px 14px',
                background: PN.PINK_SOFT, border: `1px dashed ${PN.PINK}`,
                borderRadius: 10,
                fontSize: 14, color: PN.PINK_DARK, fontWeight: 600, lineHeight: 1.4,
              }}>
                <Icon name="pencil" size={14} color={PN.PINK_DARK}/>
                Stai modificando la dashboard — rimuovi o aggiungi widget, poi premi Salva.
              </div>
            )}
            <PnGrid
              widgets={mobileWidgets}
              editMode={editMode}
              onRemove={remove}
              onReorder={reorder}
            />
            {editMode && (
              <button onClick={() => setDrawerOpen(true)} style={{
                padding:'20px',
                background:'transparent',
                border: `2px dashed ${PN.MUTED_LIGHT}`,
                borderRadius: 14,
                cursor:'pointer', fontFamily:'inherit',
                color: PN.MUTED, fontWeight: 600, fontSize: 15,
                display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
              }}>
                <Icon name="plus" size={16}/> Aggiungi widget
              </button>
            )}
          </div>
        </PnMobileShell>
        <PnAddWidgetDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          currentIds={widgets.map(w => w.id)}
          onAdd={add}
        />
        {popupNavConfirm}
      </React.Fragment>
    );
  }

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      <PnSidebar onNav={handleNav}/>
      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: '16px 28px 24px',
          background: PN.BG,
          display:'flex', flexDirection:'column', gap: 14,
        }}>
          <PnPageActions
            editMode={editMode}
            onToggleEdit={toggleEdit}
            onAddWidget={() => setDrawerOpen(true)}
          />

          {editMode && (
            <div style={{
              display:'flex', alignItems:'center', gap: 10,
              padding:'10px 14px',
              background: PN.PINK_SOFT, border: `1px dashed ${PN.PINK}`,
              borderRadius: 10,
              fontSize: 15, color: PN.PINK_DARK, fontWeight: 600,
            }}>
              <Icon name="pencil" size={14} color={PN.PINK_DARK}/>
              Stai modificando la dashboard — trascina, rimuovi o aggiungi widget. Premi <em style={{fontStyle:'normal', textDecoration:'underline'}}>Salva</em> quando hai finito.
            </div>
          )}

          {widgets.length === 0 ? (
            /* Empty state — dashboard senza widget: shortcut centrale */
            <div style={{flex: 1, display:'grid', placeItems:'center', minHeight: 320}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 14, textAlign:'center'}}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: PN.WHITE, border: `1px solid ${PN.BORDER_HAIR}`,
                  boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.06)',
                  display:'grid', placeItems:'center', color: PN.MUTED,
                }}>
                  <Icon name="grid" size={28}/>
                </div>
                <div>
                  <div style={{fontSize: 19, fontWeight: 700, color: PN.TEXT}}>La tua dashboard è vuota</div>
                  <div style={{fontSize: 15, color: PN.MUTED, marginTop: 4, maxWidth: 340, lineHeight: 1.5}}>
                    Aggiungi i widget che vuoi tenere sott'occhio: incassi, tavoli, prenotazioni, cucina e altro.
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(true)} style={{
                  display:'inline-flex', alignItems:'center', gap: 8,
                  padding:'12px 22px', borderRadius: 999,
                  background: PN.BTN_DARK, color: PN.WHITE,
                  border: '1px solid rgba(0,0,0,0.32)',
                  fontSize: 15.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                  <Icon name="plus" size={15}/> Aggiungi widget
                </button>
              </div>
            </div>
          ) : (
          <PnGrid
            widgets={widgets}
            editMode={editMode}
            onRemove={remove}
            onReorder={reorder}
          />
          )}

          {editMode && widgets.length > 0 && (
            <button onClick={() => setDrawerOpen(true)} style={{
              padding:'24px',
              background:'transparent',
              border: `2px dashed ${PN.MUTED_LIGHT}`,
              borderRadius: 14,
              cursor:'pointer', fontFamily:'inherit',
              color: PN.MUTED, fontWeight: 600, fontSize: 15.5,
              display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
            }}>
              <Icon name="plus" size={16}/> Aggiungi widget
            </button>
          )}
        </div>

        <PnAddWidgetDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          currentIds={widgets.map(w => w.id)}
          onAdd={add}
        />

        {/* Popup modifiche non salvate — appare cambiando schermata in edit mode */}
        {popupNavConfirm}
      </main>
    </div>
  );
}

// L'arrivo d'esempio: la prima notifica non letta, annunciata una volta sola
// per sessione — riaprendo la Panoramica dieci volte non si riceve dieci volte
// lo stesso avviso. Le DUE ATTIVAZIONI non passano di qui: hanno la fascia in
// cima alla pagina (PnAttivazioniFascia), che non si dissolve e non si perde,
// perché senza Stripe non si incassa e senza il fiscale lo scontrino non parte.
function PnNotificaDemo() {
  React.useEffect(() => {
    let fatto = false;
    try { fatto = sessionStorage.getItem('byup_notif_demo') === '1'; } catch (e) {}
    if (fatto || !window.byupReadNotifiche) return;
    const t = setTimeout(() => {
      const nuove = window.byupReadNotifiche().filter(x => x.unread && String(x.id).indexOf('attiva-') !== 0);
      const n = nuove.find(x => x.type === 'fiscal') || nuove[0];
      if (!n) return;
      try { sessionStorage.setItem('byup_notif_demo', '1'); } catch (e) {}
      window.byupNotificaArrivo(n);
    }, 3200);
    return () => clearTimeout(t);
  }, []);
  return null;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className="frame" data-screen-label="Panoramica">
    <GlassMeshSubstrate/>
    {/* P-115: l'avviso d'arrivo, in basso a destra. Nel mockup una notifica
        fiscale d'esempio arriva pochi secondi dopo l'apertura della
        Panoramica, così il comportamento si vede: nel prodotto è la notifica
        del browser o del dispositivo, e nasce dal registro, non da un timer. */}
    {window.PnNotifArrivo && <window.PnNotifArrivo/>}
    {/* Le due attivazioni che l'onboarding non chiede più: fascia a tutta
        larghezza in cima, persistente finché non si risponde. */}
    {window.PnAttivazioniFascia && <window.PnAttivazioniFascia/>}
    {/* Le due fasce della stampa (P-128): la stampante di cucina muta e il
        documento che aspetta una postazione. Stanno dove sta la fascia delle
        attivazioni, perché nascono mentre si lavora e chi deve agire non è
        detto che stia guardando la pagina in cui il fatto è successo. */}
    {window.PnStampaFasce && <window.PnStampaFasce/>}
    <PnNotificaDemo/>
    <PnApp/>
  </div>
);
