// byup Staff — Sala (lista tavoli) + Profilo

const { useState: useStateS, useEffect: useEffectS } = React;

// ═══════════════════════════════════════════════════════════
// SALA — lista tavoli (Attivi / Liberi)
// ═══════════════════════════════════════════════════════════
function ScreenSala({ nav, openModal }) {
  const [tab, setTab] = useStateS('attivi');
  const [search, setSearch] = useStateS(false);

  const tavoli = TAVOLI;
  const liberi = TAVOLI_LIBERI;

  return (
    <div style={{ background: ST.BG, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '64px 20px 0', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.PINK_DARK, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Trattoria del Borgo · Marco
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, marginTop: 2 }}>
              Sala
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => openModal({ kind: 'notifiche' })} style={{
              width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
              background: ST.SURF_ALT, position: 'relative', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I.Bell s={20}/>
              <span style={{
                position: 'absolute', top: 8, right: 9, width: 8, height: 8,
                borderRadius: ST.R_PILL, background: ST.PINK_DARK,
                border: '2px solid ' + ST.SURF_ALT,
              }}/>
            </button>
            <button onClick={() => setSearch(s => !s)} style={{
              width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
              background: ST.SURF_ALT, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.Search s={18}/></button>
          </div>
        </div>

        {/* Riassunto turno */}
        <div style={{
          display: 'flex', gap: 16, padding: '14px 0 16px',
          borderTop: `1px solid ${ST.BORDER_SOFT}`, marginTop: 16,
        }}>
          <Stat n={tavoli.length} l="Attivi"/>
          <Stat n={tavoli.filter(t => t.stato === 'pronto').length} l="Da servire" warn/>
          <Stat n={liberi.filter(t => t.stato === 'prenotato').length} l="Prenotati"/>
          <Stat n={STAFF_USER.oggi.scontrino} l="€/cop" euro/>
        </div>

        {/* Tab segmented */}
        <div style={{
          display: 'flex', background: ST.SURF_ALT, borderRadius: ST.R_PILL,
          padding: 3, marginBottom: 16,
        }}>
          {[
            { id: 'attivi', label: `Attivi (${tavoli.length})` },
            { id: 'liberi', label: `Liberi (${liberi.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, height: 38, borderRadius: ST.R_PILL, border: 'none',
              background: tab === t.id ? '#fff' : 'transparent',
              boxShadow: tab === t.id ? ST.SH_SM : 'none',
              fontSize: 13.5, fontWeight: tab === t.id ? 700 : 600,
              color: tab === t.id ? ST.TEXT : ST.MUTED,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding: '14px 16px 110px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'attivi'
          ? tavoli.map(t => <TavoloCardAttivo key={t.id} t={t} onOpen={() => nav.push({ s: 'tavolo', id: t.id })} onPay={() => nav.push({ s: 'pagamento-split', id: t.id })} onActions={() => openModal({ kind: 'tavolo-actions', tavolo: t })}/>)
          : liberi.map(t => <TavoloCardLibero key={t.id} t={t} onConferma={() => openModal({ kind: 'conferma-presenza', tavolo: t })} onModifica={() => openModal({ kind: 'modifica-prenotazione', tavolo: t })} onWalkIn={() => openModal({ kind: 'walk-in', tavolo: t })}/>)}

        {tab === 'liberi' && (
          <button onClick={() => openModal({ kind: 'walk-in' })} style={{
            marginTop: 12, height: 56, borderRadius: ST.R_LG, border: `2px dashed ${ST.MUTED_3}`,
            background: 'transparent', color: ST.MUTED, fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <I.Plus s={18} c={ST.MUTED}/> Walk-in (cliente senza prenotazione)
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ n, l, warn, euro }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 22, fontWeight: 800, color: warn ? ST.PINK_DARK : ST.TEXT,
        letterSpacing: -0.4, lineHeight: 1,
      }}>{euro ? `€${n}` : n}</div>
      <div style={{ fontSize: 11, color: ST.MUTED, marginTop: 4, fontWeight: 500 }}>{l}</div>
    </div>
  );
}

// ─── Card tavolo ATTIVO ─────────────────────────────────────
function TavoloCardAttivo({ t, onOpen, onPay, onActions }) {
  const cfg = statoConfig(t.stato);
  const urgente = t.stato === 'pronto' || t.stato === 'conto';
  return (
    <div style={{
      background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden',
      boxShadow: ST.SH_SM,
      border: urgente ? `1.5px solid ${cfg.color}` : `1px solid ${ST.BORDER_SOFT}`,
    }}>
      {/* status banner per urgenti */}
      {urgente && (
        <div style={{
          background: cfg.color, color: '#fff',
          padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
          letterSpacing: 0.4, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{t.azione}</span>
          {t.stato === 'pronto' && <span>● ora</span>}
        </div>
      )}

      <div onClick={onOpen} style={{ padding: 14, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <StatusDot stato={t.stato}/>
              <span style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>
                Tavolo {t.n}
              </span>
              <Chip color={cfg.color} bg={cfg.bg}>{cfg.label}</Chip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: ST.MUTED, marginTop: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <I.Users s={13} c={ST.MUTED}/> {t.coperti} coperti
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <I.Clock s={13} c={ST.MUTED}/> {t.sedutiDa} min
              </span>
              <span>· {t.ordini} portate</span>
            </div>
            {!urgente && t.azione && (
              <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 6, fontStyle: 'italic' }}>
                {t.azione}
              </div>
            )}
            {(t.allergie?.length > 0 || t.note) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {t.allergie?.map(a => (
                  <span key={a} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    height: 22, padding: '0 8px', borderRadius: ST.R_PILL,
                    background: ALLERGENI[a]?.bg, color: ALLERGENI[a]?.color,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <span style={{ fontSize: 11 }}>{ALLERGENI[a]?.icon}</span>
                    {ALLERGENI[a]?.name}
                  </span>
                ))}
                {t.note && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: ST.MUTED }}>
                    <I.Note s={11}/> {t.note}
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5, lineHeight: 1 }}>
              €{t.saldo}
            </div>
            <div style={{ fontSize: 10.5, color: ST.MUTED, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Saldo
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={(e) => { e.stopPropagation(); onPay(); }} style={{
            flex: 1, height: 44, borderRadius: ST.R_PILL, border: 'none',
            background: urgente ? ST.PINK_DARK : ST.TEXT, color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <I.Card s={16} c="#fff"/> Paga
          </button>
          <button onClick={(e) => { e.stopPropagation(); onActions(); }} style={{
            flex: 0.7, height: 44, borderRadius: ST.R_PILL,
            border: `1.5px solid ${ST.BORDER}`, background: '#fff', color: ST.TEXT,
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <I.More s={18}/> Azioni
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card tavolo LIBERO/PRENOTATO ──────────────────────────
function TavoloCardLibero({ t, onConferma, onModifica, onWalkIn }) {
  const isPrenotato = t.stato === 'prenotato';
  return (
    <div style={{
      background: '#fff', borderRadius: ST.R_LG, padding: 14,
      boxShadow: ST.SH_SM, border: `1px solid ${ST.BORDER_SOFT}`,
    }}>
      {isPrenotato && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', background: ST.ST_BOOKED_BG, color: ST.ST_BOOKED,
          borderRadius: ST.R_PILL, fontSize: 11, fontWeight: 700,
          marginBottom: 10,
        }}>
          <I.Clock s={11} c={ST.ST_BOOKED}/> Prenotazione tra {t.prenotazione.quando}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusDot stato={t.stato}/>
            <span style={{ fontSize: 16, fontWeight: 800, color: ST.TEXT }}>
              Tavolo {t.n}
            </span>
            <span style={{ fontSize: 12.5, color: ST.MUTED }}>· {t.coperti} coperti</span>
          </div>
          {isPrenotato && (
            <div style={{ fontSize: 13, color: ST.TEXT_SOFT, marginTop: 4, fontWeight: 500 }}>
              {t.prenotazione.nome} <span style={{ color: ST.MUTED, fontWeight: 400 }}>· {t.prenotazione.tel}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {isPrenotato ? (
          <>
            <button onClick={onModifica} style={{
              flex: 1, height: 42, borderRadius: ST.R_PILL,
              border: `1.5px solid ${ST.BORDER}`, background: '#fff', color: ST.TEXT,
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            }}>Modifica</button>
            <button onClick={onConferma} style={{
              flex: 1.2, height: 42, borderRadius: ST.R_PILL, border: 'none',
              background: ST.PINK_DARK, color: '#fff',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}>Conferma presenza</button>
          </>
        ) : (
          <button onClick={onWalkIn} style={{
            flex: 1, height: 42, borderRadius: ST.R_PILL, border: 'none',
            background: ST.TEXT, color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <I.Walk s={16} c="#fff"/> Apri walk-in
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILO
// ═══════════════════════════════════════════════════════════
function ScreenProfilo({ nav }) {
  const sections = [
    { title: 'Informazioni account', items: [
      { i: <I.Calendar s={18}/>, l: 'Visualizza turni', d: 'Oggi 17:00 – 23:30' },
      { i: <I.Clock s={18}/>, l: 'Attività cameriere', d: '24 ordini oggi' },
      { i: <I.Stats s={18}/>, l: 'Statistiche', d: '€42 medio scontrino' },
      { i: <I.Refresh s={18}/>, l: 'Ripeti onboarding', d: null },
    ]},
    { title: 'Regolamenti', items: [
      { i: <I.Note s={18}/>, l: 'Termini e condizioni' },
      { i: <I.Note s={18}/>, l: 'Privacy policy' },
      { i: <I.Alert s={18} c={ST.MUTED}/>, l: 'Segnala un problema' },
    ]},
    { title: 'Account', items: [
      { i: <I.Bell s={18}/>, l: 'Impostazioni notifiche' },
      { i: <I.Settings s={18}/>, l: 'Gestione account' },
      { i: <I.Refresh s={18}/>, l: 'Cambia locale' },
      { i: <I.Logout s={18} c="#DC2626"/>, l: 'Logout', danger: true },
    ]},
  ];

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: 110 }}>
      <div style={{ padding: '64px 20px 24px', background: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>
          Profilo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: ST.R_PILL,
            background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff',
            boxShadow: ST.SH_MD,
          }}>MR</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>{STAFF_USER.nome}</div>
            <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 2 }}>
              {STAFF_USER.ruolo} · {STAFF_USER.account}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, padding: '3px 8px', background: ST.ST_BUSY_BG, color: ST.ST_BUSY, borderRadius: ST.R_PILL, fontSize: 10.5, fontWeight: 700 }}>
              ● In turno · {STAFF_USER.turno}
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {[
            { l: 'Ordini', v: STAFF_USER.oggi.ordini },
            { l: 'Scontrino medio', v: '€'+STAFF_USER.oggi.scontrino },
            { l: 'Mance', v: '€'+STAFF_USER.oggi.mance },
          ].map(s => (
            <div key={s.l} style={{
              flex: 1, padding: '10px 12px', background: ST.SURF_ALT, borderRadius: ST.R_MD,
            }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: ST.MUTED, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {sections.map((sec, i) => (
        <div key={i} style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px 8px' }}>
            {sec.title}
          </div>
          <div style={{ background: '#fff', borderRadius: 0 }}>
            {sec.items.map((it, j) => (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px',
                borderTop: j === 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                borderBottom: `1px solid ${ST.BORDER_SOFT}`,
                cursor: 'pointer',
              }}>
                <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.i}</div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: it.danger ? '#DC2626' : ST.TEXT }}>
                  {it.l}
                  {it.d && <div style={{ fontSize: 12, color: ST.MUTED, marginTop: 2, fontWeight: 400 }}>{it.d}</div>}
                </div>
                {!it.danger && <I.ChevRight s={16} c={ST.MUTED_2}/>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Switch app cliente */}
      <div style={{ marginTop: 24, padding: '0 24px 8px', fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        Il mio byup
      </div>
      <div style={{ background: '#fff', padding: '14px 20px', borderTop: `1px solid ${ST.BORDER_SOFT}`, borderBottom: `1px solid ${ST.BORDER_SOFT}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}><I.User s={18}/></div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>Switch app cliente</div>
        <div style={{ width: 44, height: 26, borderRadius: ST.R_PILL, background: ST.MUTED_3, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: 2, width: 22, height: 22, borderRadius: ST.R_PILL, background: '#fff', boxShadow: ST.SH_SM }}/>
        </div>
      </div>

      <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 11, color: ST.MUTED_2 }}>
        byup Staff · v1.0.0
      </div>
    </div>
  );
}

Object.assign(window, { ScreenSala, ScreenProfilo });
