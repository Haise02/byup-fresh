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
  return (
    <div onClick={onClick} style={{
      position:'relative',
      background: primary ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : PN.WHITE,
      border: primary ? 'none' : `1px solid ${PN.BORDER}`,
      borderRadius: 14,
      padding: 18,
      cursor:'pointer',
      transition:'transform 0.15s, box-shadow 0.15s',
      color: primary ? '#fff' : PN.TEXT,
      display:'flex', flexDirection:'column', minHeight: 168,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = primary ? '0 12px 28px rgba(37,99,235,0.3)' : '0 8px 20px rgba(15,23,42,0.06)'; }}
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
          }}>{badge}</span>
        )}
      </div>
      <div style={{fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: -0.2}}>{title}</div>
      <div style={{fontSize: 12.5, color: primary ? 'rgba(255,255,255,0.85)' : PN.MUTED, lineHeight: 1.5, marginBottom: 14, flex: 1}}>{desc}</div>
      {primary ? (
        <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} style={{
          alignSelf:'flex-start',
          background:'#fff', color:'#1d4ed8',
          border:'none', borderRadius: 10,
          padding:'9px 16px', fontSize: 12.5, fontWeight: 700,
          fontFamily:'inherit', cursor:'pointer',
        }}>{cta}</button>
      ) : (
        <div style={{fontSize: 12.5, fontWeight: 600, color: PN.PINK}}>{cta} →</div>
      )}
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
