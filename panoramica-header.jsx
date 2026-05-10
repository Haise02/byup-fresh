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
        <div style={{fontSize: 12, fontWeight: 600, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4}}>
          Trattoria del Borgo · Centro storico
        </div>
        <h1 style={{margin: 0, fontSize: 22, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em'}}>
          Buongiorno Marco
        </h1>
      </div>

      <PnNotifBell/>
    </header>
  );
}

// Inline action row above the grid — Personalizza / Aggiungi widget / Fine
function PnPageActions({ editMode, onToggleEdit, onAddWidget }) {
  return (
    <div style={{display:'flex', justifyContent:'flex-end', gap: 10}}>
      {editMode && (
        <button onClick={onAddWidget} style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          padding: '7px 13px',
          background: PN.TEXT, color: PN.WHITE,
          border:'none', borderRadius: 9,
          fontWeight: 600, fontSize: 12.5, fontFamily:'inherit',
          cursor:'pointer',
        }}>
          <PnI.Plus size={13}/> Aggiungi widget
        </button>
      )}
      <button onClick={onToggleEdit} style={{
        display:'inline-flex', alignItems:'center', gap: 6,
        padding: '7px 13px',
        background: editMode ? PN.PINK : PN.WHITE,
        color: editMode ? PN.WHITE : PN.TEXT,
        border: `1px solid ${editMode ? PN.PINK : PN.BORDER}`,
        borderRadius: 9,
        fontWeight: 600, fontSize: 12.5, fontFamily:'inherit',
        cursor:'pointer',
      }}>
        {editMode ? <><PnI.Check size={13}/> Fine</> : <><PnI.Edit size={13}/> Personalizza</>}
      </button>
    </div>
  );
}

window.PnPageActions = PnPageActions;

window.PnHeader = PnHeader;
