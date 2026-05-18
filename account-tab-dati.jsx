// Account — Tab Dati generali

function AccDatiGenerali() {
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <AcCard title="Profilo personale" subtitle="Le informazioni del tuo account.">
        <div style={{display:'flex', alignItems:'center', gap: 18, marginBottom: 22}}>
          <div style={{
            width: 72, height: 72, borderRadius:'50%',
            background:`linear-gradient(135deg, ${PN.PINK_DARK}, #B91C5C)`,
            color: PN.WHITE, display:'grid', placeItems:'center',
            fontSize: 26, fontWeight: 800,
          }}>MR</div>
          <div>
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>{ACC_DATI.nome} {ACC_DATI.cognome}</div>
            <div style={{fontSize: 13, color: PN.MUTED, marginTop: 2}}>{ACC_DATI.ruolo} · {ACC_DATI.ristorante}</div>
            <div style={{display:'flex', gap: 8, marginTop: 10}}>
              <button style={AcBtnGhost}>Cambia foto</button>
              <button style={AcBtnGhost}>Rimuovi</button>
            </div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
          <AcField label="Nome" value={ACC_DATI.nome}/>
          <AcField label="Cognome" value={ACC_DATI.cognome}/>
          <AcField label="Email" value={ACC_DATI.email}/>
          <AcField label="Telefono" value={ACC_DATI.telefono}/>
        </div>
      </AcCard>

      <AcCard title="I tuoi locali" subtitle="Locali gestiti da questo account · clicca per accedere al gestionale del singolo locale." action={
        <button style={{
          padding:'8px 14px', borderRadius: 999,
          background: PN.TEXT, color: PN.WHITE, border:'none',
          fontSize: 12.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap: 6,
        }}>
          <PnI.Plus size={13} color={PN.WHITE}/> Aggiungi locale
        </button>
      }>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 12}}>
          {[
            { name: 'Cacio e Pepe', city: 'Roma · Trastevere', addr: 'Via dei Giubbonari 27', role: 'Owner', active: true,
              cover: 'linear-gradient(135deg, #8B4513, #D2691E)', logo: 'CP' },
            { name: 'Cacio e Pepe — Ostiense', city: 'Roma · Ostiense', addr: 'Via Ostiense 142', role: 'Owner', active: false,
              cover: 'linear-gradient(135deg, #E04347, #B53338)', logo: 'CO' },
            { name: 'Trattoria del Borgo', city: 'Frascati · RM', addr: 'Piazza San Pietro 4', role: 'Manager', active: false,
              cover: 'linear-gradient(135deg, #2E7D32, #66BB6A)', logo: 'TB' },
          ].map((loc) => (
            <div key={loc.name} style={{
              border: `1px solid ${loc.active ? PN.PINK : PN.BORDER_SOFT}`,
              borderRadius: 14, overflow:'hidden', background: PN.WHITE,
              cursor:'pointer', transition:'box-shadow .15s, transform .15s',
              boxShadow: loc.active ? '0 0 0 2px rgba(233,30,99,0.08)' : 'none',
            }}>
              <div style={{
                height: 90, background: loc.cover, position:'relative',
                display:'flex', alignItems:'flex-end', padding: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, padding: 3,
                  background: PN.WHITE, boxShadow:'0 2px 6px rgba(0,0,0,0.15)',
                }}>
                  <div style={{
                    width:'100%', height:'100%', borderRadius: 7,
                    background:'linear-gradient(135deg, #FF5A5F, #E04347)',
                    display:'grid', placeItems:'center',
                    color:'#fff', fontSize: 13, fontWeight: 800,
                  }}>{loc.logo}</div>
                </div>
                {loc.active && (
                  <span style={{
                    position:'absolute', top: 10, right: 10,
                    fontSize: 10, fontWeight: 800, color: PN.WHITE,
                    background: 'rgba(0,0,0,0.55)', padding:'3px 8px', borderRadius: 999,
                    backdropFilter:'blur(6px)', letterSpacing: 0.4,
                  }}>ATTIVO</span>
                )}
              </div>
              <div style={{padding: '14px 16px 16px'}}>
                <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
                  <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{loc.name}</div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding:'2px 8px', borderRadius: 999,
                    background: loc.role === 'Owner' ? PN.PINK_SOFT : '#EFF1F4',
                    color: loc.role === 'Owner' ? PN.PINK_DARK : PN.MUTED,
                    letterSpacing: 0.3,
                  }}>{loc.role.toUpperCase()}</span>
                </div>
                <div style={{fontSize: 12.5, color: PN.MUTED}}>{loc.city}</div>
                <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>{loc.addr}</div>
                <div style={{display:'flex', gap: 6, marginTop: 12}}>
                  <button style={{
                    flex:1, padding:'7px 10px', borderRadius: 8,
                    background: loc.active ? PN.PINK_SOFT : PN.TEXT,
                    color: loc.active ? PN.PINK_DARK : PN.WHITE,
                    border:'none', fontSize: 12, fontWeight: 700,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>{loc.active ? '✓ In uso' : 'Apri gestionale →'}</button>
                  <button title="Impostazioni locale" style={{
                    width: 32, height: 32, borderRadius: 8,
                    background:'transparent', border:`1px solid ${PN.BORDER}`,
                    cursor:'pointer', display:'grid', placeItems:'center',
                  }}>
                    <PnI.Settings size={14} color={PN.MUTED}/>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new — dashed card */}
          <button style={{
            border: `2px dashed ${PN.BORDER}`,
            borderRadius: 14, background: 'transparent',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap: 8, padding: 24, cursor:'pointer', fontFamily:'inherit',
            color: PN.MUTED, minHeight: 220,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: PN.PINK_SOFT, color: PN.PINK,
              display:'grid', placeItems:'center',
            }}>
              <PnI.Plus size={22} color={PN.PINK}/>
            </div>
            <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>Aggiungi un nuovo locale</div>
            <div style={{fontSize: 12, color: PN.MUTED, textAlign:'center', maxWidth: 220, lineHeight: 1.4}}>
              Apri un secondo punto vendita o gestisci una nuova attività con lo stesso account.
            </div>
          </button>
        </div>
      </AcCard>

      <AcCard title="Lingua e regione" subtitle="Preferenze locali.">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14}}>
          <AcField label="Lingua" value="Italiano"/>
          <AcField label="Fuso orario" value="Europe/Rome (UTC+1)"/>
          <AcField label="Valuta" value="EUR (€)"/>
        </div>
      </AcCard>

      <AcCard title="Zona pericolosa" danger subtitle="Azioni irreversibili.">
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>Elimina account</div>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2}}>
              Tutti i dati del ristorante verranno cancellati definitivamente.
            </div>
          </div>
          <button style={{
            padding:'10px 18px', borderRadius: 999,
            background: PN.WHITE, color: PN.RED,
            border:`1px solid ${PN.RED}`,
            fontSize: 13, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit',
          }}>Elimina account</button>
        </div>
      </AcCard>
    </div>
  );
}

function AcCard({ title, subtitle, children, danger, aurora }) {
  // L2 Aurora soft wash multi-color (pink + lavender + cream mesh).
  // Sistema 75/15/10.
  const auroraBg =
    'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
    'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
    'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
    'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)';
  return (
    <div style={{
      background: aurora ? auroraBg : PN.WHITE,
      borderRadius: 14,
      border: `1px solid ${danger ? '#FECACA' : aurora ? 'rgba(190, 175, 220, 0.14)' : PN.BORDER_SOFT}`,
      padding: 22,
    }}>
      <div style={{marginBottom: 18}}>
        <div style={{fontSize: 15, fontWeight: 700, color: danger ? PN.RED : PN.TEXT}}>{title}</div>
        {subtitle && <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 3}}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function AcField({ label, value, full }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 11, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <div style={{
        padding:'10px 12px', borderRadius: 10,
        border:`1px solid ${PN.BORDER}`, background: '#FAFBFC',
        fontSize: 13.5, color: PN.TEXT, fontWeight: 500,
      }}>{value}</div>
    </div>
  );
}

const AcBtnGhost = {
  padding:'7px 14px', borderRadius: 999,
  background: PN.WHITE, color: PN.TEXT,
  border:`1px solid ${PN.BORDER}`,
  fontSize: 12, fontWeight: 600, cursor:'pointer',
  fontFamily:'inherit',
};

window.AccDatiGenerali = AccDatiGenerali;
window.AcCard = AcCard;
window.AcField = AcField;
window.AcBtnGhost = AcBtnGhost;
