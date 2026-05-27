// 3 card canale + search

function SupChannelCards({ onChat, onEmail, onCall }) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
      <SupCard
        icon={<PnI.Chat size={20}/>}
        iconBg="#dcfce7" iconColor="#15803d"
        badge="Online ora" badgeBg="#dcfce7" badgeColor="#15803d"
        title="Chat live"
        desc="Parla con il chatbot byup in tempo reale. Risposta istantanea."
        cta="Avvia la chat"
        onClick={onChat}
      />
      <SupCard
        icon={<PnI.Mail size={20}/>}
        iconBg="#dbeafe" iconColor="#1d4ed8"
        badge="Risposta entro 4 ore" badgeBg="#dbeafe" badgeColor="#1d4ed8"
        title="Email"
        desc="Invia una richiesta dettagliata. Ideale per problemi tecnici complessi o documentazione."
        cta="Contattaci via email"
        onClick={onEmail}
      />
      <SupCard
        primary
        icon={<PnI.Phone size={20}/>}
        iconBg="rgba(255,255,255,0.18)" iconColor="#fff"
        title="Chiama un operatore"
        desc="Parla con un operatore byup e risolvi la tua richiesta."
        cta="Prenota una chiamata"
        onClick={onCall}
      />
    </div>
  );
}

function SupCard({ icon, iconBg, iconColor, badge, badgeBg, badgeColor, title, desc, cta, onClick, primary }) {
  // Card primary (Chiama un operatore) → dark-glass Byup brand (#FF6066 dominante).
  // Card non-primary (Chat, Email) → light original styling.
  if (primary) {
    return (
      <GlassDarkBox
        padding={18}
        borderRadius={14}
        liftHover
        onClick={onClick}
        style={{
          cursor:'pointer',
          display:'flex', flexDirection:'column', minHeight: 168,
        }}
      >
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14}}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.55)',
            color: '#7C2D3C',
            display:'grid', placeItems:'center', fontSize: 20,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(255, 130, 130, 0.30), 0 1px 2px rgba(124, 45, 60, 0.10)',
          }}>{icon}</div>
          {badge && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.55)',
              color: '#7C2D3C',
              padding: '4px 10px', borderRadius: 999,
              boxShadow: 'inset 0 0 0 1px rgba(255, 130, 130, 0.30)',
            }}>{badge}</span>
          )}
        </div>
        <div style={{fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: -0.2, color: '#3A0A0E'}}>{title}</div>
        <div style={{fontSize: 12.5, color: 'rgba(58, 10, 14, 0.75)', lineHeight: 1.5, marginBottom: 14, flex: 1}}>{desc}</div>
        <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
          className="glass-shimmer"
          style={{
            alignSelf:'flex-start',
            background:'#7C2D3C', color:'#fff',
            border:'none', borderRadius: 10,
            padding:'9px 16px', fontSize: 12.5, fontWeight: 700,
            fontFamily:'inherit', cursor:'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 12px -4px rgba(124, 45, 60, 0.50)',
            position: 'relative',
          }}>
          <span style={{position:'relative', zIndex: 3}}>{cta}</span>
        </button>
      </GlassDarkBox>
    );
  }

  // Light styling (Chat, Email) — ripristino dell'originale.
  return (
    <div onClick={onClick} style={{
      position:'relative',
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 14,
      padding: 18,
      cursor:'pointer',
      transition:'transform 0.15s, box-shadow 0.15s',
      color: PN.TEXT,
      display:'flex', flexDirection:'column', minHeight: 168,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,23,42,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14}}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: iconBg, color: iconColor,
          display:'grid', placeItems:'center', fontSize: 20,
        }}>{icon}</div>
        {badge && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: badgeBg, color: badgeColor,
            padding: '4px 10px', borderRadius: 999,
            border: `1px solid ${badgeColor}33`,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {badge === 'Online ora' && (
              <span className="glass-pulse-glow" style={{
                width: 6, height: 6, borderRadius: 999,
                background: badgeColor, display: 'inline-block',
              }}/>
            )}
            {badge}
          </span>
        )}
      </div>
      <div style={{fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: -0.2}}>{title}</div>
      <div style={{fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5, marginBottom: 14, flex: 1}}>{desc}</div>
      <div style={{fontSize: 12.5, fontWeight: 600, color: PN.PINK}}>{cta} →</div>
    </div>
  );
}

function SupSearch({ value, onChange }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 10,
      padding: '12px 16px',
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 12,
    }}>
      <span style={{color: PN.MUTED, display: 'flex', alignItems: 'center'}}><PnI.Search size={16} color={PN.MUTED}/></span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca guide, tutorial o FAQ… (es: come configurare i pagamenti)"
        style={{
          flex: 1, border:'none', outline:'none',
          fontSize: 13.5, color: PN.TEXT,
          background:'transparent', fontFamily:'inherit',
        }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          background:'transparent', border:'none',
          color: PN.MUTED, fontSize: 13, cursor:'pointer',
        }}>✕</button>
      )}
    </div>
  );
}

window.SupChannelCards = SupChannelCards;
window.SupSearch = SupSearch;
