// Top-level app

// Layout default — 2 fold visibili.
// Top-left: prenotazioni / Top-right: financials uniti (incassi+scontrino+coperti)
// Bottom-left: recensioni recenti / Bottom-right: riempimento mese
// Sotto la fold: il resto come prima.
// Layout default — REGOLA: ogni widget occupa MAX 2 slot in una direzione
// (wide 2×1 o tall 1×2), oppure 1×1. NON 2×2. Eccezione: WidgetAzioni è il
// launcher full-row (4×2), trattato come oversize fisso.
//
// L'utente può modificare le dimensioni in edit mode tramite i due pulsanti
// resize sulla card (↔ wide, ↕ tall) — il vincolo viene applicato lì.
// Top-fold: prenotazioni-oggi (col 1, tall) + financials (col 2-3, top half wide)
// + tavoli-stato (col 2-3, bottom half wide) + cucina-live (col 4, tall).
// Le 4 occupano una riga visiva da 2 grid rows → fold riempita armonicamente.
const DEFAULT_LAYOUT = [
  { id: 'prenotazioni-oggi', size: { w: 1, h: 2 } },  // tall: lista coperti
  { id: 'financials',        size: { w: 2, h: 1 } },  // wide: incassi banner (top)
  { id: 'cucina-live',       size: { w: 1, h: 2 } },  // tall: lista ordini (dark)
  { id: 'tavoli-stato',      size: { w: 2, h: 1 } },  // wide: stato tavoli (sotto financials)
  { id: 'azioni',            size: { w: 4, h: 2 } },  // FULL ROW launcher (resizable)
  { id: 'riempimento',       size: { w: 2, h: 1 } },  // wide: occupancy
  { id: 'top-piatti',        size: { w: 1, h: 2 } },  // tall: classifica (dark)
  { id: 'coperti-sett',      size: { w: 2, h: 1 } },  // wide: bar chart
  { id: 'recensioni',        size: { w: 1, h: 2 } },  // tall: lista recensioni
];

// Layout persistito: le modifiche salvate (Fine / "Salva ed esci") e i drag
// fuori dall'edit mode sopravvivono al cambio pagina via localStorage.
const PN_LAYOUT_KEY = 'byup_dashboard_layout';
function pnLoadLayout() {
  try {
    const raw = localStorage.getItem(PN_LAYOUT_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length && arr.every(w => w && w.id && w.size)) return arr;
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

  const remove = (id) => setWidgets(ws => ws.filter(w => w.id !== id));
  const add = (id) => {
    const def = PN_WIDGET_CATALOG.find(c => c.id === id);
    if (!def) return;
    setWidgets(ws => [...ws, { id, size: def.defaultSize }]);
    setDrawerOpen(false);
  };
  // Resize handler: PnWidgetShell ha già forzato la regola (un solo raddoppio
  // per direzione rispetto alla base). Qui mi limito ad applicare.
  const resize = (id, newSize) => {
    setWidgets(ws => ws.map(w => w.id === id ? { ...w, size: newSize } : w));
  };
  const reorder = (fromId, toId) => {
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
              Modalità personalizzazione attiva — trascina, rimuovi o aggiungi widget. Clicca <em style={{fontStyle:'normal', textDecoration:'underline'}}>Fine</em> per salvare.
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
            onResize={resize}
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
        {navConfirm && (
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
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className="frame" data-screen-label="Panoramica">
    <GlassMeshSubstrate/>
    <PnApp/>
  </div>
);
