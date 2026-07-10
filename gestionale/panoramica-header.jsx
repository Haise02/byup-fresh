// Header — page title + search + utility

// Inline action row above the grid — Personalizza / Aggiungi widget / Salva.
// Sticky: resta visibile in alto a destra anche scorrendo la dashboard.
function PnPageActions({ editMode, onToggleEdit, onAddWidget }) {
  return (
    <div style={{
      display:'flex', justifyContent:'flex-end', gap: 10,
      position:'sticky', top: 6, zIndex: 40,
      // Nessun fondo: fluttuano solo le pillole, che hanno superficie
      // piena e ombra proprie — niente strisce sopra i widget.
      pointerEvents: 'none',
    }}>
      {editMode && (
        <button onClick={onAddWidget} style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          padding: '7px 13px',
          background: PN.TEXT, color: PN.WHITE,
          border:'none', borderRadius: 9,
          fontWeight: 600, fontSize: 14.5, fontFamily:'inherit',
          cursor:'pointer', pointerEvents:'auto',
          boxShadow: '0 3px 12px rgba(15,17,21,0.18)',
        }}>
          <Icon name="plus" size={13}/> Aggiungi widget
        </button>
      )}
      <button onClick={onToggleEdit} style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding: '7px 13px',
        background: editMode ? PN.PINK : PN.WHITE,
        color: editMode ? PN.WHITE : PN.TEXT,
        border: `1px solid ${editMode ? PN.PINK : PN.BORDER}`,
        borderRadius: 9,
        fontWeight: 600, fontSize: 14.5, fontFamily:'inherit',
        cursor:'pointer', pointerEvents:'auto',
        boxShadow: '0 3px 12px rgba(15,17,21,0.18)',
      }}>
        {editMode ? <><Icon name="check" size={13}/> Salva</> : <><Icon name="pencil" size={13}/> Personalizza</>}
      </button>
    </div>
  );
}

window.PnPageActions = PnPageActions;
