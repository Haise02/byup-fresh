// 3 card canale + search

function SupChannelCards({ onChat, onEmail, onCall }) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
      <SupCard
        icon={<PnI.Chat size={20}/>}
        iconBg="#dcfce7" iconColor="#15803d"
        badge="Online ora" badgeBg="#dcfce7" badgeColor="#15803d"
        title="Chat live"
        desc="Parla con l'assistente IA byup in tempo reale. Risposta immediata."
        cta="Avvia la chat"
        onClick={onChat}
      />
      <SupCard
        icon={<PnI.FileText size={20}/>}
        iconBg="#dbeafe" iconColor="#1d4ed8"
        badge="Risposta entro 2 giorni lavorativi" badgeBg="#dbeafe" badgeColor="#1d4ed8"
        title="Ticket"
        desc="Apri una richiesta tracciata. Ideale per problemi tecnici complessi o documentazione."
        cta="Apri un ticket"
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
            display:'grid', placeItems:'center', fontSize: 22,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(255, 130, 130, 0.30), 0 1px 2px rgba(124, 45, 60, 0.10)',
          }}>{icon}</div>
          {badge && (
            <span style={{
              fontSize: 13, fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.55)',
              color: '#7C2D3C',
              padding: '4px 10px', borderRadius: 999,
              boxShadow: 'inset 0 0 0 1px rgba(255, 130, 130, 0.30)',
            }}>{badge}</span>
          )}
        </div>
        <div style={{fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: -0.2, color: '#3A0A0E'}}>{title}</div>
        <div style={{fontSize: 14.5, color: 'rgba(58, 10, 14, 0.75)', lineHeight: 1.5, marginBottom: 14, flex: 1}}>{desc}</div>
        <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
          className="glass-shimmer"
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.filter = 'brightness(1.18)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 20px -4px rgba(124, 45, 60, 0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 12px -4px rgba(124, 45, 60, 0.50)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
          style={{
            alignSelf:'flex-start',
            background:'#7C2D3C', color:'#fff',
            border:'none', borderRadius: 10,
            padding:'9px 16px', fontSize: 14.5, fontWeight: 700,
            fontFamily:'inherit', cursor:'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 12px -4px rgba(124, 45, 60, 0.50)',
            position: 'relative',
            transition: 'transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), filter 140ms ease, box-shadow 150ms ease',
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
          display:'grid', placeItems:'center', fontSize: 22,
        }}>{icon}</div>
        {badge && (
          <span style={{
            fontSize: 13, fontWeight: 600,
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
      <div style={{fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: -0.2}}>{title}</div>
      <div style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.5, marginBottom: 14, flex: 1}}>{desc}</div>
      <div style={{fontSize: 14.5, fontWeight: 600, color: PN.PINK}}>{cta} →</div>
    </div>
  );
}

// La ricerca apre la pagina, sopra le card dei canali: in un centro
// assistenza la prima mossa è cercare, chiamare o scrivere è quello che si fa
// se la ricerca non basta. Prima stava incastrata fra due superfici bianche e
// col bordo tenue spariva — sembrava un pannello spento, non un campo.
function SupSearch({ value, onChange }) {
  const [fuoco, setFuoco] = React.useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 12,
      padding: '13px 16px',
      background: PN.WHITE,
      border: `1px solid ${fuoco ? PN.PINK : PN.BORDER}`,
      borderRadius: 14,
      // L'anello al fuoco e l'ombra a riposo: sono le due cose che dicono
      // "qui si scrive" senza aggiungere una riga di testo.
      boxShadow: fuoco ? '0 0 0 3px rgba(255,90,95,0.16)' : PN.CARD_SHADOW,
      transition:'border-color 140ms ease, box-shadow 140ms ease',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: PN.PINK_BG_SOFT, color: PN.PINK,
        display:'grid', placeItems:'center',
      }}><PnI.Search size={16} color={PN.PINK}/></span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFuoco(true)}
        onBlur={() => setFuoco(false)}
        placeholder="Cerca una guida, un video o una domanda frequente…"
        style={{
          flex: 1, minWidth: 0, border:'none', outline:'none',
          fontSize: 16, color: PN.TEXT,
          background:'transparent', fontFamily:'inherit',
        }}
      />
      {value ? (
        <button onClick={() => onChange('')} aria-label="Cancella la ricerca" style={{
          background:'transparent', border:'none', padding: 4,
          color: PN.MUTED, fontSize: 15, cursor:'pointer', lineHeight: 0,
        }}>✕</button>
      ) : (
        // L'esempio esce dal placeholder: lì dentro faceva una riga lunghissima
        // che si leggeva come una frase, non come un suggerimento.
        <span style={{fontSize: 13.5, color: PN.MUTED_SOFT, whiteSpace:'nowrap', flexShrink: 0}}>
          es. come configurare i pagamenti
        </span>
      )}
    </div>
  );
}

window.SupChannelCards = SupChannelCards;
window.SupSearch = SupSearch;
