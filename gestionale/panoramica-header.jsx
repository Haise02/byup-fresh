// Header — page title + search + utility

function PnHeader({ editMode, onToggleEdit, onAddWidget }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 28px 14px',
      borderBottom: `1px solid ${PN.BORDER_HAIR}`,
      background: PN.WHITE_OFF,
    }}>
      <div style={{flex: 1}}>
        <div style={{fontSize: 14, fontWeight: 600, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4}}>
          Trattoria del Borgo · Centro storico
        </div>
        <h1 style={{margin: 0, fontSize: 24, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em'}}>
          Buongiorno Marco
        </h1>
      </div>

      <PnConnectionStatus/>
      <PnNotifBell/>
    </header>
  );
}

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

window.PnHeader = PnHeader;
