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

function PnApp() {
  const [editMode, setEditMode] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [widgets, setWidgets] = React.useState(DEFAULT_LAYOUT);

  const remove = (id) => setWidgets(ws => ws.filter(w => w.id !== id));
  const add = (id) => {
    const def = PN_WIDGET_CATALOG.find(c => c.id === id);
    if (!def) return;
    setWidgets(ws => [...ws, { id, size: def.defaultSize }]);
    setDrawerOpen(false);
  };
  // Resize handler: PnWidgetShell ha già forzato la regola (max 2 in 1 dim,
  // mai 2×2). Qui mi limito ad applicare. fixedSize è gestito dalla shell.
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
      return next;
    });
  };

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      <PnSidebar/>
      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        <PnHeader/>

        <div className="pn-scroll" style={{
          flex: 1, overflow: 'auto',
          padding: '16px 28px 24px',
          background: PN.BG,
          display:'flex', flexDirection:'column', gap: 14,
        }}>
          <PnPageActions
            editMode={editMode}
            onToggleEdit={() => setEditMode(e => !e)}
            onAddWidget={() => setDrawerOpen(true)}
          />

          {editMode && (
            <div style={{
              display:'flex', alignItems:'center', gap: 10,
              padding:'10px 14px',
              background: PN.PINK_SOFT, border: `1px dashed ${PN.PINK}`,
              borderRadius: 10,
              fontSize: 13, color: PN.PINK_DARK, fontWeight: 600,
            }}>
              <Icon name="pencil" size={14} color={PN.PINK_DARK}/>
              Modalità personalizzazione attiva — trascina, rimuovi o aggiungi widget. Clicca <em style={{fontStyle:'normal', textDecoration:'underline'}}>Fine</em> per salvare.
            </div>
          )}

          <PnGrid
            widgets={widgets}
            editMode={editMode}
            onRemove={remove}
            onReorder={reorder}
            onResize={resize}
          />

          {editMode && (
            <button onClick={() => setDrawerOpen(true)} style={{
              padding:'24px',
              background:'transparent',
              border: `2px dashed ${PN.MUTED_LIGHT}`,
              borderRadius: 14,
              cursor:'pointer', fontFamily:'inherit',
              color: PN.MUTED, fontWeight: 600, fontSize: 13.5,
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
