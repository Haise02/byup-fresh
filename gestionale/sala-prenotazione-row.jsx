// Sala / Prenotazioni — riga-card in vetro (ricetta L2, coerente con la
// tessera tavolo): orario grande, nome, coperti, stato come PILL traslucida.
// Stessa logica-colore della Sala: confermata=viola (prenotato),
// arrivata/seduta=coral (occupato), in attesa=ambra, no-show/cancellata=grigio.
//
//   <PrenotazioneRow r={{time,dur,name,posti,table,status,note,notes,source}}
//                    selected onClick density="comfort|compact"/>

const RES_ROW_META = {
  inattesa:   { label: 'In attesa',  tint: 'rgba(217, 119, 6, 0.14)',  ring: 'rgba(217, 119, 6, 0.38)',  ink: '#B45309', dot: '#D97706' },
  confermata: { label: 'Confermata', tint: 'rgba(124, 58, 237, 0.12)', ring: 'rgba(124, 58, 237, 0.34)', ink: '#6D28D9', dot: '#7C3AED' },
  arrivata:   { label: 'Seduta',     tint: 'rgba(255, 90, 95, 0.16)',  ring: 'rgba(227, 36, 89, 0.36)',  ink: '#E32459', dot: '#FF5A5F' },
  noshow:     { label: 'No-show',    tint: 'rgba(107, 114, 128, 0.12)',ring: 'rgba(107, 114, 128, 0.30)',ink: '#6B7280', dot: '#9CA3AF' },
  cancellata: { label: 'Cancellata', tint: 'rgba(107, 114, 128, 0.10)',ring: 'rgba(107, 114, 128, 0.26)',ink: '#9CA3AF', dot: '#C5C8CE' },
};

// Pill stato traslucida — non sfora mai (maxWidth + ellissi, vedi contratto
// anti-overflow di OrdineRow/StatoPill in sala-card.jsx)
function ResStatusPill({ status }) {
  const m = RES_ROW_META[status] || RES_ROW_META.inattesa;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px 3px 7px', borderRadius: 999,
      background: m.tint,
      boxShadow: `inset 0 0 0 1px ${m.ring}`,
      color: m.ink,
      fontSize: 11.5, fontWeight: 700, lineHeight: 1.3,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
      maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
    }}>
      <span style={{width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0}}/>
      {m.label}
    </span>
  );
}

// Chip nota critica (allergia) o ricorrenza — discreta, accanto al nome
function ResNoteChip({ note }) {
  if (!note) return null;
  const isAllergia = note.type === 'allergia';
  return (
    <span title={note.text} style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 999,
      background: isAllergia ? 'rgba(220, 38, 38, 0.10)' : 'rgba(124, 58, 237, 0.08)',
      boxShadow: `inset 0 0 0 1px ${isAllergia ? 'rgba(220,38,38,0.32)' : 'rgba(124,58,237,0.22)'}`,
      color: isAllergia ? '#DC2626' : '#6D28D9',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
      textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {isAllergia ? 'Allergia' : (note.type || 'Nota')}
    </span>
  );
}

function PrenotazioneRow({ r, selected, urgent, onClick, density = 'comfort', style, children }) {
  const [hover, setHover] = React.useState(false);
  const m = RES_ROW_META[r.status] || RES_ROW_META.inattesa;
  const ghost = r.status === 'noshow' || r.status === 'cancellata';
  const compact = density === 'compact';

  const lifted = !ghost && (hover || selected);
  const shadow = selected
    ? 'inset 0 0 0 1.25px rgba(227, 36, 89, 0.40), 0 0 0 2px rgba(255,255,255,0.95), 0 0 0 4px rgba(255, 90, 95, 0.55), 0 16px 40px rgba(80, 40, 80, 0.16)'
    : lifted
      ? '0 16px 40px rgba(80, 40, 80, 0.14), 0 4px 10px rgba(80, 40, 80, 0.07)'
      : '0 10px 30px rgba(80, 40, 80, 0.08)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center',
        gap: compact ? 12 : 16,
        padding: compact ? '8px 14px' : '12px 16px',
        borderRadius: 18,
        backgroundColor: ghost ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.56)',
        backgroundImage: ghost ? 'none'
          : 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0) 100%)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: `1px solid rgba(255, 255, 255, ${ghost ? 0.55 : 0.8})`,
        boxShadow: shadow,
        transform: lifted ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: onClick ? 'pointer' : 'default',
        opacity: ghost ? 0.72 : 1,
        userSelect: 'none',
        minWidth: 0,
        ...style,
      }}>

      {/* Orario — tipografia display, tabulare */}
      <div style={{flexShrink: 0, textAlign: 'center', minWidth: compact ? 46 : 54}}>
        <div style={{
          fontSize: compact ? 16 : 19, fontWeight: 800, lineHeight: 1,
          color: ghost ? '#9CA3AF' : (urgent ? '#E32459' : '#0F1115'),
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
        }}>{r.time}</div>
        {!compact && r.dur && (
          <div style={{fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginTop: 3, fontVariantNumeric: 'tabular-nums'}}>
            {r.dur}′
          </div>
        )}
      </div>

      {/* Hairline verticale di separazione */}
      <div style={{width: 1, alignSelf: 'stretch', background: 'rgba(15,17,21,0.06)', flexShrink: 0}}/>

      {/* Nome + meta */}
      <div style={{flex: '1 1 0%', minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 7, minWidth: 0}}>
          <span style={{
            fontSize: compact ? 13 : 14, fontWeight: 700,
            color: ghost ? '#9CA3AF' : '#0F1115',
            letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: r.status === 'cancellata' ? 'line-through' : 'none',
          }}>{r.name || 'Walk-in'}</span>
          <ResNoteChip note={r.note}/>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: compact ? 11 : 12, fontWeight: 500, color: '#6B7280',
          marginTop: compact ? 1 : 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {/* coperti */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          <span style={{fontVariantNumeric: 'tabular-nums'}}>{r.posti}</span>
          {r.table != null && (
            <React.Fragment>
              <span style={{color: '#C5C8CE'}}>·</span>
              <span><span style={{color: '#9CA3AF', fontWeight: 600}}>T</span><b style={{fontWeight: 700, color: '#6B7280'}}>{r.table}</b></span>
            </React.Fragment>
          )}
          {r.phone && !compact && (
            <React.Fragment>
              <span style={{color: '#C5C8CE'}}>·</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.phone}</span>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Pill stato — mai oltre il padding della card */}
      <div style={{flexShrink: 0, maxWidth: '40%', display: 'inline-flex'}}>
        <ResStatusPill status={r.status}/>
      </div>

      {children}
    </div>
  );
}

window.PrenotazioneRow = PrenotazioneRow;
window.ResStatusPill = ResStatusPill;
window.RES_ROW_META = RES_ROW_META;
