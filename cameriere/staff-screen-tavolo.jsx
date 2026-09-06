// byup Staff — Tavolo Detail (hub di un singolo tavolo)

// Dispatcher: stesso "tavolo" in due varianti di hub a seconda dello stato.
//  · occupato            → hub in SERVIZIO (conto, da inviare, aggiungi/conto)
//  · libero / prenotato  → hub in ATTESA (gestione + Attiva / Cancella prenot.)
function ScreenTavolo({ nav, openModal, tavoloId }) {
  const { attivi, liberi } = useTavoli();
  const t = [...attivi, ...liberi].find(x => x.id === tavoloId) || attivi[0];
  return t.stato === 'occupato'
    ? <TavoloHubServizio t={t} nav={nav} openModal={openModal}/>
    : <TavoloHubAttesa t={t} nav={nav} openModal={openModal}/>;
}

// ─── Hub in servizio (occupato) ─────────────────────────────
function TavoloHubServizio({ t, nav, openModal }) {
  const totale = t.saldo || 0; // quanto deve il tavolo (il dettaglio dei piatti vive nel Conto)
  // Saldato = ha consumato e il conto è a zero: non c'è più nulla da incassare,
  // resta solo da liberare. In quel caso la CTA primaria è "Libera", non "Conto".
  const saldato = t.ordini > 0 && !(totale > 0);
  const cfg = statoConfig(t.stato);
  const isComposto = String(t.n || '').includes('+');
  const [editCop, setEditCop] = React.useState(false); // coperti: modifica inline dal numero
  const [inviaSel, setInviaSel] = React.useState({});  // selezione articoli da inviare (default: tutti)
  const [gestAperta, setGestAperta] = React.useState(false); // sezione Gestione tavolo collassabile

  return (
    <div style={{ background: ST.BG, minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: cfg.bg, color: cfg.color, borderRadius: ST.R_PILL, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
              <StatusDot stato={t.stato} size={6}/> {cfg.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6, color: ST.TEXT, lineHeight: 1 }}>
              Tavolo {t.n}
            </div>
            <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 12, rowGap: 6 }}>
              {/* Coperti: tap sul numero → stepper inline (niente menu) */}
              {editCop ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Stepper value={t.coperti} onChange={(n) => TavoliStore.setCoperti(t.id, n)}/>
                  <button onClick={() => setEditCop(false)} style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, color: ST.PINK_DARK, fontFamily: 'inherit',
                  }}>Fatto</button>
                </span>
              ) : (
                <button onClick={() => setEditCop(true)} style={{
                  border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, color: ST.MUTED, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}><I.Users s={13} c={ST.MUTED}/> {t.coperti} <I.Edit s={11} c={ST.MUTED_2}/></button>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.Clock s={13} c={ST.MUTED}/> {t.sedutiDa} min</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.6, lineHeight: 1 }}>
              €{totale}
            </div>
            <div style={{ fontSize: 10.5, color: ST.MUTED, marginTop: 4, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Totale conto
            </div>
          </div>
        </div>

        {/* Occasioni + allergie sulla stessa riga (pill); nota sotto, se presente.
            Occasioni = viola (gestionale), allergie = colore allergene. */}
        {(t.tags?.length > 0 || t.allergie?.length > 0 || t.note) && (
          <div style={{ marginTop: 12 }}>
            {(t.tags?.length > 0 || t.allergie?.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(t.tags || []).map(tag => (
                  <span key={tag} style={{
                    display: 'inline-flex', alignItems: 'center',
                    height: 26, padding: '0 12px', borderRadius: ST.R_PILL,
                    background: ST.PURPLE_SOFT, color: statoConfig('prenotato').color, border: `1px solid ${statoConfig('prenotato').ring}`,
                    fontSize: 12, fontWeight: 700,
                  }}>{tag}</span>
                ))}
                {(t.allergie || []).map(a => (
                  <span key={a} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    height: 26, padding: '0 11px', borderRadius: ST.R_PILL,
                    background: ALLERGENI[a]?.bg, color: ALLERGENI[a]?.color,
                    fontSize: 12, fontWeight: 700,
                  }}>{ALLERGENI[a]?.icon} {ALLERGENI[a]?.name}</span>
                ))}
              </div>
            )}
            {t.note && (
              <div style={{ fontSize: 12.5, color: ST.TEXT_SOFT, marginTop: (t.tags?.length > 0 || t.allergie?.length > 0) ? 8 : 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <I.Note s={13} c={ST.MUTED}/> {t.note}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gestione tavolo — collassabile, subito sotto l'header. Chiusa di
          default; al tap si estende e mostra i pulsanti. I coperti si modificano
          dal numero in alto; qui spostamento, unione/divisione e chiusura. */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          <button onClick={() => setGestAperta(o => !o)} style={{
            width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <I.Settings s={17} c={ST.TEXT}/>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 700, color: ST.TEXT }}>Gestione tavolo</span>
            <I.ChevDown s={16} c={ST.MUTED} style={{ transform: gestAperta ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 180ms' }}/>
          </button>
          {gestAperta && [
            { i: <I.Walk s={18} c={ST.TEXT}/>, l: 'Sposta tavolo', d: 'Porta i clienti su un altro tavolo', a: () => openModal({ kind: 'modifica-tavolo', tavolo: t, only: 'sposta' }) },
            { i: <I.Merge s={18} c={ST.TEXT}/>, l: 'Unisci a un tavolo', d: 'Accorpa per un gruppo più grande', a: () => openModal({ kind: 'modifica-tavolo', tavolo: t, only: 'unisci' }) },
            isComposto && { i: <I.Split s={18} c={ST.TEXT}/>, l: 'Dividi', d: 'Separa i tavoli del gruppo', a: () => openModal({ kind: 'modifica-tavolo', tavolo: t, only: 'disgiungi' }) },
            { i: <I.Close s={18} c={ST.RED}/>, l: 'Libera tavolo', d: 'Chiudi senza pagamento', danger: true, a: () => openModal({ kind: 'conferma-libera', tavolo: t }) },
          ].filter(Boolean).map((it, i) => (
            <div key={i} onClick={it.a} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderTop: `1px solid ${ST.BORDER_SOFT}`, cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: ST.R_MD,
                background: it.danger ? ST.RED_SOFT : ST.SURF_ALT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{it.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: it.danger ? ST.RED : ST.TEXT }}>{it.l}</div>
                <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{it.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Da inviare — in cima al corpo. Stessa logica di "Da portare":
          tap sulla riga per selezionare; nessuna selezione = invia tutti.
          "Lo porto io" è per riga (swipe o manina), non una seconda CTA:
          vedi SwipeDaInviare in staff-tokens.jsx. */}
      {t.daInviare > 0 && (() => {
        const items = t.daInviareItems || [];
        const selCount = items.filter((_, i) => inviaSel[i]).length;
        const toggle = (i) => setInviaSel({ ...inviaSel, [i]: !inviaSel[i] });
        const selezioneOTutti = () =>
          selCount > 0 ? items.map((_, i) => i).filter(i => inviaSel[i]) : items.map((_, i) => i);
        const invia = () => {
          TavoliStore.inviaCucinaItems(t.id, selezioneOTutti());
          setInviaSel({});
          // Cucina chiusa (P-167 · D-117): l'invio passa, con l'avviso e l'ora.
          openModal({ kind: 'send-success', avviso: window.byupAvvisoCucinaChiusa ? window.byupAvvisoCucinaChiusa() : null });
        };
        const portaIo = (indici) => {
          TavoliStore.portaDirettoItems(t.id, indici);
          setInviaSel({});
        };
        return (
          <div style={{
            margin: '16px 16px 0', padding: 14,
            background: ST.ST_BOOKED_BG, borderRadius: ST.R_MD,
            border: `1px solid ${ST.ST_BOOKED}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: ST.ST_BOOKED, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <I.Receipt s={15} c={ST.ST_BOOKED}/> {t.daInviare} {t.daInviare === 1 ? 'piatto' : 'piatti'} da inviare
            </div>

            {items.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((it, i) => (
                  <SwipeDaInviare
                    key={`${it.nome}-${i}`} it={it} on={!!inviaSel[i]}
                    accent={ST.ST_BOOKED} bg="#fff" rowBg={ST.ST_BOOKED_BG}
                    onTap={() => toggle(i)} onPortaIo={() => portaIo([i])}
                  />
                ))}
              </div>
            )}

            <Btn variant="primary" full onClick={invia} style={{ marginTop: 12 }}>
              <I.Receipt s={16} c="#fff"/> {selCount > 0 && selCount < items.length ? 'Invia selezionati' : 'Invia tutti'}
            </Btn>
          </div>
        );
      })()}

      {/* Barra azioni — sticky: resta agganciata in fondo alla viewport mentre
          scrolli, ma occupa il suo spazio nel flusso (così NON si sovrappone alle
          card). Sta sopra la BottomNav (~78px + safe-area). */}
      <div style={{
        position: 'sticky', zIndex: 30,
        bottom: 'calc(84px + env(safe-area-inset-bottom))',
        marginTop: 'auto', padding: '16px 16px 0',
        background: 'linear-gradient(180deg, transparent 0%, #fff 35%)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => nav.push({ s: 'menu', tavoloId: t.id })} style={{
            flex: 1, height: 52, borderRadius: ST.R_PILL, border: 'none',
            background: ST.TEXT, color: '#fff',
            fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: ST.SH_MD,
          }}>
            <I.Plus s={18} c="#fff"/> Aggiungi articolo
          </button>
          {saldato ? (
            <button onClick={() => openModal({ kind: 'conferma-libera', tavolo: t })} style={{
              flex: 1, height: 52, borderRadius: ST.R_PILL, border: 'none',
              background: ST.PINK_DARK, color: '#fff',
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: ST.SH_FAB,
            }}>
              <I.Check s={18} c="#fff"/> Libera
            </button>
          ) : (
            <button onClick={() => nav.push({ s: 'pagamento-split', id: t.id })} style={{
              flex: 1, height: 52, borderRadius: ST.R_PILL, border: 'none',
              background: ST.PINK_DARK, color: '#fff',
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: ST.SH_FAB,
            }}>
              <I.Receipt s={18} c="#fff"/> Conto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hub in attesa (libero / prenotato) ─────────────────────
// Stesso "guscio" dell'hub occupato (header + lista azioni), ma il corpo è la
// GESTIONE del tavolo (modifica/unisci/sposta/disgiungi) e in fondo le due CTA:
// Attiva tavolo e — solo per i prenotati — Cancella prenotazione. Così la card in
// sala porta una sola azione e tutto il resto vive qui.
function TavoloHubAttesa({ t, nav, openModal }) {
  const cfg = statoConfig(t.stato);
  const isComposto = String(t.n || '').includes('+');
  const isPrenotato = t.stato === 'prenotato';
  const pren = t.prenotazione;

  // Riga di contesto sotto il numero: per il prenotato il nome + quando/ritardo,
  // altrimenti i posti disponibili.
  const ritardo = pren?.ritardo || 0;

  const azioni = [
    // Sposta solo per i prenotati (spostare la prenotazione su un altro tavolo);
    // su un libero non c'è nulla da spostare. Sta in cima: è la mossa più probabile
    // su un prenotato (cambiare il tavolo assegnato), sopra Unisci.
    isPrenotato && { i: <I.Walk s={18} c={ST.TEXT}/>, l: 'Sposta prenotazione', d: 'Sposta la prenotazione su un altro tavolo',
      a: () => openModal({ kind: 'modifica-tavolo', tavolo: t, scope: 'libero', only: 'sposta' }) },
    { i: <I.Merge s={18} c={ST.TEXT}/>, l: 'Unisci a un tavolo', d: 'Accorpa per un gruppo più grande',
      a: () => openModal({ kind: 'modifica-tavolo', tavolo: t, scope: 'libero', only: 'unisci' }) },
    isComposto && { i: <I.Split s={18} c={ST.TEXT}/>, l: 'Dividi', d: 'Separa i tavoli del gruppo',
      a: () => openModal({ kind: 'modifica-tavolo', tavolo: t, scope: 'libero', only: 'disgiungi' }) },
  ].filter(Boolean);

  return (
    <div style={{ background: ST.BG, minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
        </div>

        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: cfg.bg, color: cfg.color, borderRadius: ST.R_PILL, fontSize: 11, fontWeight: 700 }}>
            <StatusDot stato={t.stato} size={6}/> {cfg.label}
          </span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6, color: ST.TEXT, lineHeight: 1, marginTop: 6 }}>
          Tavolo {t.n}
        </div>

        {/* Contesto: prenotato → nome + quando/ritardo; libero → posti.
            Il numero (posti/coperti) è solo informativo: si decide all'attivazione,
            quindi qui NON è modificabile. */}
        <div style={{ fontSize: 13, color: ST.MUTED, marginTop: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 12, rowGap: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            {isPrenotato ? <I.Users s={13} c={ST.MUTED}/> : <I.Chair s={13} c={ST.MUTED}/>} {t.coperti}
          </span>
          {isPrenotato && pren && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: ritardo > 0 ? statoConfig('prenotato').color : ST.MUTED, fontWeight: ritardo > 0 ? 700 : 600 }}>
              <I.Clock s={13} c={ritardo > 0 ? statoConfig('prenotato').color : ST.MUTED}/>
              {pren.nome}{ritardo > 0 ? ` · in ritardo di ${ritardo}'` : ` · tra ${pren.quando}`}
            </span>
          )}
        </div>
      </div>

      {/* Gestione tavolo — qui è il corpo principale dell'hub, quindi sempre
          visibile (niente collasso): le azioni di gestione sono il motivo del tap. */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden', boxShadow: ST.SH_SM }}>
          {azioni.map((it, i) => (
            <div key={i} onClick={it.a} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderTop: i === 0 ? 'none' : `1px solid ${ST.BORDER_SOFT}`, cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: ST.R_MD, background: ST.SURF_ALT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{it.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ST.TEXT }}>{it.l}</div>
                <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 2 }}>{it.d}</div>
              </div>
              <I.ChevRight s={14} c={ST.MUTED}/>
            </div>
          ))}
        </div>
      </div>

      {/* Barra azioni — sticky in fondo: Attiva tavolo (primaria) e, solo per i
          prenotati, Cancella prenotazione (distruttiva). */}
      <div style={{
        position: 'sticky', zIndex: 30,
        bottom: 'calc(84px + env(safe-area-inset-bottom))',
        marginTop: 'auto', padding: '16px 16px 0',
        background: 'linear-gradient(180deg, transparent 0%, #fff 35%)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => openModal({ kind: 'attiva-tavolo', tavolo: t })} style={{
            height: 52, borderRadius: ST.R_PILL, border: 'none',
            background: ST.PINK_DARK, color: '#fff',
            fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: ST.SH_FAB,
          }}>
            <I.Walk s={18} c="#fff"/> Attiva tavolo
          </button>
          {isPrenotato && (
            <button onClick={() => openModal({ kind: 'conferma-cancella-prenotazione', tavolo: t, noShow: ritardo >= STAFF_SETTINGS.tolleranzaNoShow })} style={{
              height: 48, borderRadius: ST.R_PILL, border: `1px solid rgba(220, 38, 38, 0.35)`,
              background: '#fff', color: ST.RED,
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <I.Close s={16} c={ST.RED}/> Cancella prenotazione
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTavolo });
