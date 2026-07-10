// Account — Tab Dati generali

// I locali gestiti da questo account. L'attivo è condiviso via
// window.byupReadLocale/byupWriteLocale (definiti in panoramica-sidebar.jsx).
const ACC_LOCALI = [
  { id: 'cp', name: 'Cacio e Pepe', city: 'Roma · Trastevere', addr: 'Via dei Giubbonari 27', role: 'Owner',
    cover: 'linear-gradient(135deg, #8B4513, #D2691E)', logo: 'CP' },
  { id: 'co', name: 'Cacio e Pepe — Ostiense', city: 'Roma · Ostiense', addr: 'Via Ostiense 142', role: 'Owner',
    cover: 'linear-gradient(135deg, #E04347, #B53338)', logo: 'CO' },
  { id: 'tb', name: 'Trattoria del Borgo', city: 'Frascati · RM', addr: 'Piazza San Pietro 4', role: 'Manager',
    cover: 'linear-gradient(135deg, #2E7D32, #66BB6A)', logo: 'TB' },
];

function AccDatiGenerali() {
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  // Foto profilo: url (null = iniziali), posizione dell'inquadratura in %, popup.
  const [fotoOpen, setFotoOpen] = React.useState(false);
  const [foto, setFoto] = React.useState(null);            // { url, pos:{x,y} } | null
  const [fotoHover, setFotoHover] = React.useState(false);
  // Preferenze locali — modificabili.
  const [lingua, setLingua] = React.useState('Italiano');
  const [fuso, setFuso] = React.useState('Europe/Rome (UTC+1)');
  const [valuta, setValuta] = React.useState('EUR (€)');
  // Dati personali modificabili: draft (a video) vs salvati; le modifiche
  // vanno confermate con "Salva modifiche" o scartate con "Annulla".
  const [datiSalvati, setDatiSalvati] = React.useState({
    nome: ACC_DATI.nome, cognome: ACC_DATI.cognome,
    email: ACC_DATI.email, telefono: ACC_DATI.telefono,
  });
  const [datiDraft, setDatiDraft] = React.useState(datiSalvati);
  const [datiToast, setDatiToast] = React.useState(null);
  const datiDirty = JSON.stringify(datiDraft) !== JSON.stringify(datiSalvati);
  const setCampo = (k) => (v) => setDatiDraft(d => ({ ...d, [k]: v }));
  const salvaDati = () => {
    setDatiSalvati(datiDraft);
    setDatiToast('✓ Dati profilo aggiornati');
    setTimeout(() => setDatiToast(null), 2600);
  };
  // Locale attivo + cambio contesto: breve transizione, persistenza condivisa
  // (sidebar inclusa), poi si apre la Panoramica del locale scelto.
  const [localeAttivo, setLocaleAttivo] = React.useState(() =>
    (window.byupReadLocale && window.byupReadLocale()) || { id: 'cp', nome: 'Cacio e Pepe' });
  const [switching, setSwitching] = React.useState(null); // id del locale in apertura
  const apriGestionale = (loc) => {
    if (switching || loc.id === localeAttivo.id) return;
    setSwitching(loc.id);
    setTimeout(() => {
      const nuovo = { id: loc.id, nome: loc.name };
      if (window.byupWriteLocale) window.byupWriteLocale(nuovo);
      setLocaleAttivo(nuovo);
      setSwitching(null);
      setDatiToast(`✓ Ora stai gestendo ${loc.name} — apro la Panoramica…`);
      setTimeout(() => { window.location.href = 'byup Panoramica.html'; }, 1200);
    }, 900);
  };
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      <AcCard title="Profilo personale" subtitle="Le informazioni del tuo account.">
        <div style={{display:'flex', alignItems:'center', gap: 18, marginBottom: 22}}>
          {/* Avatar cliccabile — apre il popup di gestione foto */}
          <button
            onClick={() => setFotoOpen(true)}
            onMouseEnter={() => setFotoHover(true)}
            onMouseLeave={() => setFotoHover(false)}
            title="Gestisci la foto profilo"
            style={{
              width: 72, height: 72, borderRadius:'50%', flexShrink: 0,
              padding: 0, border: 'none', cursor: 'pointer',
              position:'relative', overflow:'hidden',
              background: foto ? PN.WHITE : `linear-gradient(135deg, ${PN.PINK_DARK}, #B91C5C)`,
              color: PN.WHITE, display:'grid', placeItems:'center',
              fontSize: 28, fontWeight: 800, fontFamily:'inherit',
            }}>
            {foto ? (
              <img src={foto.url} alt="Foto profilo" style={{
                position:'absolute', inset: 0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:`${foto.pos.x}% ${foto.pos.y}%`,
              }}/>
            ) : 'MR'}
            {/* overlay hover: segnala che la foto è cliccabile */}
            <span style={{
              position:'absolute', inset: 0, borderRadius:'50%',
              background:'rgba(15,17,21,0.45)',
              display:'grid', placeItems:'center',
              opacity: fotoHover ? 1 : 0, transition:'opacity 150ms',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>
            </span>
          </button>
          <div>
            <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT}}>{datiSalvati.nome} {datiSalvati.cognome}</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2}}>{ACC_DATI.ruolo} · {localeAttivo.nome}</div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
          <AcEditField label="Nome" value={datiDraft.nome} onChange={setCampo('nome')}/>
          <AcEditField label="Cognome" value={datiDraft.cognome} onChange={setCampo('cognome')}/>
          <AcEditField label="Email" type="email" value={datiDraft.email} onChange={setCampo('email')}/>
          <AcEditField label="Telefono" type="tel" value={datiDraft.telefono} onChange={setCampo('telefono')}/>
        </div>

        {/* Barra conferma — compare solo con modifiche in sospeso */}
        {datiDirty && (
          <div style={{
            display:'flex', alignItems:'center', gap: 10,
            marginTop: 16, padding: '10px 14px',
            background: PN.PINK_SOFT, border: `1px dashed ${PN.PINK}`,
            borderRadius: 10,
          }}>
            <span style={{flex: 1, fontSize: 14.5, fontWeight: 600, color: PN.PINK_DARK}}>
              Hai modifiche non salvate.
            </span>
            <button
              onClick={() => setDatiDraft(datiSalvati)}
              style={{
                padding:'8px 14px', borderRadius: 999,
                background: PN.WHITE, color: PN.TEXT,
                border:`1px solid ${PN.BORDER}`,
                fontSize: 14, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>
              Annulla
            </button>
            <button
              onClick={salvaDati}
              style={{
                padding:'8px 16px', borderRadius: 999,
                background: PN.BTN_DARK, color: PN.WHITE,
                border: '1px solid rgba(0,0,0,0.32)',
                fontSize: 14, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>
              Salva modifiche
            </button>
          </div>
        )}

        {datiToast && (
          <div style={{
            position:'absolute', bottom: 28, left:'50%', transform:'translateX(-50%)',
            background:'#0F1115', color:'#fff',
            padding:'12px 22px', borderRadius: 999,
            fontSize: 15.5, fontWeight: 700, zIndex: 120,
            whiteSpace:'nowrap',
            boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
          }}>{datiToast}</div>
        )}
      </AcCard>

      <AcCard title="I tuoi locali" subtitle="Locali gestiti da questo account · clicca per accedere al gestionale del singolo locale." action={
        <button onClick={() => { window.location.href = 'byup Restaurant Onboarding.html'; }} style={{
          padding:'8px 14px', borderRadius: 999,
          background: PN.TEXT, color: PN.WHITE, border:'none',
          fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap: 6,
        }}>
          <PnI.Plus size={13} color={PN.WHITE}/> Aggiungi locale
        </button>
      }>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 12}}>
          {switching && <style>{`@keyframes acSpin { to { transform: rotate(360deg); } }`}</style>}
          {ACC_LOCALI.map((loc) => {
            const active = loc.id === localeAttivo.id;
            const opening = switching === loc.id;
            return (
            <div key={loc.id}
              onClick={() => apriGestionale(loc)}
              style={{
              border: `1px solid ${active ? PN.PINK : PN.BORDER_SOFT}`,
              borderRadius: 14, overflow:'hidden', background: PN.WHITE,
              cursor: active ? 'default' : 'pointer',
              transition:'box-shadow .15s, transform .15s, opacity .15s',
              boxShadow: active ? '0 0 0 2px rgba(233,30,99,0.08)' : 'none',
              opacity: switching && !opening && !active ? 0.6 : 1,
            }}
              onMouseEnter={e => { if (!active && !switching) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,17,21,0.10)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = active ? '0 0 0 2px rgba(233,30,99,0.08)' : 'none'; }}
            >
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
                    color:'#fff', fontSize: 15, fontWeight: 800,
                  }}>{loc.logo}</div>
                </div>
                {active && (
                  <span style={{
                    position:'absolute', top: 10, right: 10,
                    fontSize: 12, fontWeight: 800, color: PN.WHITE,
                    background: 'rgba(0,0,0,0.55)', padding:'3px 8px', borderRadius: 999,
                    backdropFilter:'blur(6px)', letterSpacing: 0.4,
                  }}>ATTIVO</span>
                )}
              </div>
              <div style={{padding: '14px 16px 16px'}}>
                <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
                  <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{loc.name}</div>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    padding:'2px 8px', borderRadius: 999,
                    background: loc.role === 'Owner' ? PN.PINK_SOFT : '#EFF1F4',
                    color: loc.role === 'Owner' ? PN.PINK_DARK : PN.MUTED,
                    letterSpacing: 0.3,
                  }}>{loc.role.toUpperCase()}</span>
                </div>
                <div style={{fontSize: 14.5, color: PN.MUTED}}>{loc.city}</div>
                <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>{loc.addr}</div>
                <div style={{display:'flex', gap: 6, marginTop: 12}}>
                  <button
                    onClick={(e) => { e.stopPropagation(); apriGestionale(loc); }}
                    disabled={active || !!switching}
                    style={{
                    flex:1, padding:'7px 10px', borderRadius: 8,
                    background: active ? PN.PINK_SOFT : PN.TEXT,
                    color: active ? PN.PINK_DARK : PN.WHITE,
                    border:'none', fontSize: 14, fontWeight: 700,
                    cursor: active ? 'default' : 'pointer', fontFamily:'inherit',
                    display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 7,
                  }}>
                    {opening ? (
                      <>
                        <span style={{
                          width: 13, height: 13, borderRadius:'50%',
                          border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff',
                          animation:'acSpin 0.7s linear infinite', display:'inline-block',
                        }}/>
                        Apertura…
                      </>
                    ) : active ? '✓ In uso' : 'Apri gestionale →'}
                  </button>
                  <button
                    title="Impostazioni del locale"
                    onClick={(e) => { e.stopPropagation(); window.location.href = 'byup Impostazioni.html'; }}
                    style={{
                    width: 32, height: 32, borderRadius: 8,
                    background:'transparent', border:`1px solid ${PN.BORDER}`,
                    cursor:'pointer', display:'grid', placeItems:'center',
                  }}>
                    <PnI.Settings size={14} color={PN.MUTED}/>
                  </button>
                </div>
              </div>
            </div>
            );
          })}

          {/* Add new — dashed card → flusso di creazione = onboarding */}
          <button onClick={() => { window.location.href = 'byup Restaurant Onboarding.html'; }} style={{
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
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Aggiungi un nuovo locale</div>
            <div style={{fontSize: 14, color: PN.MUTED, textAlign:'center', maxWidth: 220, lineHeight: 1.4}}>
              Apri un secondo punto vendita o gestisci una nuova attività con lo stesso account.
            </div>
          </button>
        </div>
      </AcCard>

      <AcCard title="Lingua e regione" subtitle="Preferenze locali.">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14}}>
          <AcSelect label="Lingua" value={lingua} onChange={setLingua}
            options={['Italiano','English','Español','Français','Deutsch']}/>
          <AcSelect label="Fuso orario" value={fuso} onChange={setFuso}
            options={['Europe/Rome (UTC+1)','Europe/London (UTC+0)','Europe/Paris (UTC+1)','Europe/Madrid (UTC+1)','Europe/Berlin (UTC+1)','Europe/Athens (UTC+2)']}/>
          <AcSelect label="Valuta" value={valuta} onChange={setValuta}
            options={['EUR (€)','USD ($)','GBP (£)','CHF (Fr)']}/>
        </div>
      </AcCard>

      {fotoOpen && (
        <AcFotoModal
          foto={foto}
          onClose={() => setFotoOpen(false)}
          onSave={(next) => { setFoto(next); setFotoOpen(false); }}
        />
      )}

      {/* Logout — card senza intestazione: solo la riga azione */}
      <div style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_SOFT}`,
        padding: 22,
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Esci dall'account</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>
              Termina la sessione su questo dispositivo. Potrai rientrare con email e password.
            </div>
          </div>
          <button
            onClick={() => setLogoutConfirm(true)}
            style={{
              display:'inline-flex', alignItems:'center', gap: 8,
              padding:'10px 18px', borderRadius: 999,
              background: PN.WHITE, color: PN.TEXT,
              border:`1px solid ${PN.BORDER}`,
              fontSize: 15, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit',
              transition:'background 150ms, border-color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Esci
          </button>
        </div>
      </div>

      {/* Popup conferma logout — absolute: ancorato al frame, non alla finestra */}
      {logoutConfirm && (
        <div onClick={() => setLogoutConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 380, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: PN.PINK_SOFT, color: PN.PINK_DARK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Esci dall'account?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  La sessione su questo dispositivo verrà terminata.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { window.location.href = 'byup Login.html'; }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: PN.BTN_DARK, color: PN.WHITE,
                  border: '1px solid rgba(0,0,0,0.32)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Esci
              </button>
            </div>
          </div>
        </div>
      )}

      <AcCard title="Zona pericolosa" danger subtitle="Azioni irreversibili.">
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT}}>Elimina account</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>
              Tutti i dati del ristorante verranno cancellati definitivamente.
            </div>
          </div>
          <button
            onClick={() => setDeleteConfirm(true)}
            style={{
              padding:'10px 18px', borderRadius: 999,
              background: PN.WHITE, color: PN.RED,
              border:`1px solid ${PN.RED}`,
              fontSize: 15, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit',
              transition:'background 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; }}
          >Elimina account</button>
        </div>
      </AcCard>

      {/* Popup conferma eliminazione — danger, ancorato al frame */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 400, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#FEE2E2', color: '#DC2626',
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Eliminare l'account?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  Tutti i dati del ristorante — menu, ordini, conti e statistiche — verranno cancellati <strong>definitivamente</strong>. Questa azione non può essere annullata.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { window.location.href = 'byup Login.html'; }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: '#DC2626', color: '#fff',
                  border: '1px solid rgba(153,27,27,0.5)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
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
        <div style={{fontSize: 17, fontWeight: 700, color: danger ? PN.RED : PN.TEXT}}>{title}</div>
        {subtitle && <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3}}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function AcField({ label, value, full }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <div style={{
        padding:'10px 12px', borderRadius: 10,
        border:`1px solid ${PN.BORDER}`, background: '#FAFBFC',
        fontSize: 15.5, color: PN.TEXT, fontWeight: 500,
      }}>{value}</div>
    </div>
  );
}

const AcBtnGhost = {
  padding:'7px 14px', borderRadius: 999,
  background: PN.WHITE, color: PN.TEXT,
  border:`1px solid ${PN.BORDER}`,
  fontSize: 14, fontWeight: 600, cursor:'pointer',
  fontFamily:'inherit',
};

// Input con la stessa veste di AcField, ma modificabile.
function AcEditField({ label, value, onChange, type = 'text', full }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width:'100%', padding:'10px 12px', borderRadius: 10,
          border:`1px solid ${PN.BORDER}`, background: '#FAFBFC',
          fontSize: 15.5, color: PN.TEXT, fontWeight: 500,
          fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          transition:'border-color 150ms, background 150ms',
        }}
        onFocus={e => { e.target.style.borderColor = PN.TEXT; e.target.style.background = PN.WHITE; }}
        onBlur={e => { e.target.style.borderColor = PN.BORDER; e.target.style.background = '#FAFBFC'; }}
      />
    </div>
  );
}

// Select custom con la stessa veste di AcField: il menu nativo del browser
// non è stilizzabile, qui il pannello è in vetro (GLASS_MENU) con hover e
// spunta sull'opzione selezionata.
function AcSelect({ label, value, onChange, options, full }) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <div style={{fontSize: 13, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, marginBottom: 6}}>{label}</div>
      <div ref={ref} style={{position:'relative'}}>
        {/* Trigger — veste identica ad AcField */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width:'100%', padding:'10px 12px', borderRadius: 10,
            border:`1px solid ${open ? PN.TEXT : PN.BORDER}`,
            background: open ? PN.WHITE : '#FAFBFC',
            fontSize: 15.5, color: PN.TEXT, fontWeight: 500,
            fontFamily:'inherit', cursor:'pointer', textAlign:'left',
            display:'flex', alignItems:'center', gap: 8,
            transition:'border-color 150ms, background 150ms',
          }}
          onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = PN.BORDER; }}
        >
          <span style={{flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value}</span>
          <span style={{
            display:'inline-flex', color: PN.MUTED, flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition:'transform 180ms ease-out',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </button>

        {/* Pannello opzioni — glass menu come il resto del gestionale */}
        {open && (
          <div className="pn-scroll" style={{
            position:'absolute', top:'calc(100% + 6px)', left: 0, right: 0,
            ...PN.GLASS_MENU,
            zIndex: 60, overflow:'auto', maxHeight: 240,
            padding: 6,
          }}>
            {options.map(o => {
              const selected = o === value;
              const hov = hovered === o;
              return (
                <button
                  key={o}
                  onClick={() => { onChange(o); setOpen(false); }}
                  onMouseEnter={() => setHovered(o)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width:'100%', padding:'9px 10px', borderRadius: 8,
                    border:'none', textAlign:'left', cursor:'pointer',
                    background: hov ? 'rgba(15,17,21,0.05)' : 'transparent',
                    color: PN.TEXT,
                    fontSize: 15, fontWeight: selected ? 700 : 500,
                    fontFamily:'inherit',
                    display:'flex', alignItems:'center', gap: 8,
                    transition:'background 120ms',
                  }}>
                  <span style={{flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{o}</span>
                  {selected && (
                    <span style={{display:'inline-flex', color: PN.PINK_DARK, flexShrink: 0}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Popup gestione foto profilo: anteprima, riposizionamento a trascinamento,
// caricamento nuova, rimozione, requisiti di formato e dimensioni.
function AcFotoModal({ foto, onClose, onSave }) {
  // Copia di lavoro: Annulla scarta, Salva applica.
  const [draft, setDraft] = React.useState(foto);
  const fileRef = React.useRef(null);
  const previewRef = React.useRef(null);
  const SIZE = 200;

  const caricaFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setDraft({ url, pos: { x: 50, y: 50 } });
    e.target.value = '';
  };

  // Trascina per riposizionare: il delta del mouse sposta l'inquadratura
  // (objectPosition) in percentuale, clampata 0–100.
  const startDrag = (e) => {
    if (!draft) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...draft.pos };
    const onMove = (ev) => {
      const dx = ((ev.clientX - startX) / SIZE) * 100;
      const dy = ((ev.clientY - startY) / SIZE) * 100;
      setDraft(d => d && ({ ...d, pos: {
        x: Math.max(0, Math.min(100, startPos.x - dx)),
        y: Math.max(0, Math.min(100, startPos.y - dy)),
      }}));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 100, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20, width: 420, maxWidth:'100%',
        padding: '22px 22px 20px',
        display:'flex', flexDirection:'column', gap: 16,
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10}}>
          <div>
            <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Foto profilo</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>
              {draft ? 'Trascina la foto per riposizionarla nel cerchio.' : 'Carica una foto per il tuo profilo.'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Anteprima circolare, trascinabile */}
        <div style={{display:'grid', placeItems:'center'}}>
          <div
            ref={previewRef}
            onMouseDown={startDrag}
            style={{
              width: SIZE, height: SIZE, borderRadius:'50%',
              overflow:'hidden', position:'relative',
              cursor: draft ? 'grab' : 'default',
              background: draft ? PN.WHITE : `linear-gradient(135deg, ${PN.PINK_DARK}, #B91C5C)`,
              border: '3px solid rgba(255,255,255,0.9)',
              boxShadow: '0 8px 24px rgba(15,17,21,0.15)',
              display:'grid', placeItems:'center',
              color: PN.WHITE, fontSize: 64, fontWeight: 800,
              userSelect:'none',
            }}>
            {draft ? (
              <img src={draft.url} alt="Anteprima foto" draggable={false} style={{
                position:'absolute', inset: 0, width:'100%', height:'100%',
                objectFit:'cover', objectPosition:`${draft.pos.x}% ${draft.pos.y}%`,
                pointerEvents:'none',
              }}/>
            ) : 'MR'}
          </div>
        </div>

        {/* Azioni foto */}
        <div style={{display:'flex', gap: 8, justifyContent:'center'}}>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={caricaFile} style={{display:'none'}}/>
          <button onClick={() => fileRef.current && fileRef.current.click()} style={{
            display:'inline-flex', alignItems:'center', gap: 7,
            padding:'9px 16px', borderRadius: 999,
            background: PN.BTN_DARK, color: PN.WHITE,
            border: '1px solid rgba(0,0,0,0.32)',
            fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {draft ? 'Carica un\'altra foto' : 'Carica foto'}
          </button>
          {draft && (
            <button onClick={() => setDraft(null)} style={{
              padding:'9px 16px', borderRadius: 999,
              background:'rgba(255,255,255,0.75)', color: PN.RED,
              border: '1px solid rgba(220,38,38,0.35)',
              fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
            }}>Rimuovi</button>
          )}
        </div>

        {/* Requisiti */}
        <div style={{
          padding:'10px 14px', borderRadius: 10,
          background:'rgba(255,255,255,0.55)', border:'1px solid rgba(15,17,21,0.08)',
          fontSize: 13.5, color: PN.MUTED, lineHeight: 1.6, textAlign:'center',
        }}>
          Formati accettati: <strong>JPG, PNG o WebP</strong> · minimo <strong>400×400 px</strong><br/>
          consigliato 1000×1000 px · peso massimo 5 MB
        </div>

        {/* Footer */}
        <div style={{display:'flex', gap: 8}}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
            border: '1px solid rgba(15,17,21,0.12)',
            fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
          }}>Annulla</button>
          <button onClick={() => onSave(draft)} style={{
            flex: 1, padding: '11px 14px', borderRadius: 999,
            background: PN.BTN_DARK, color: PN.WHITE,
            border: '1px solid rgba(0,0,0,0.32)',
            fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          }}>Salva foto</button>
        </div>
      </div>
    </div>
  );
}

window.AccDatiGenerali = AccDatiGenerali;
window.AcCard = AcCard;
window.AcField = AcField;
window.AcBtnGhost = AcBtnGhost;
