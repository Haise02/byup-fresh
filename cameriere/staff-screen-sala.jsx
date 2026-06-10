// byup Staff — Sala (lista tavoli) + Profilo

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ═══════════════════════════════════════════════════════════
// SALA — lista tavoli (Attivi / Liberi)
// ═══════════════════════════════════════════════════════════
function ScreenSala({ nav, openModal }) {
  const [tab, setTab] = useStateS('attivi');
  const [q, setQ] = useStateS('');
  const [salaSel, setSalaSel] = useStateS(SALE[0]);

  // ─── Swipe orizzontale per cambiare tab ──────────────────
  const listRef = useRefS(null);
  const g = useRefS({ x0: 0, y0: 0, axis: null }); // stato gesture in un unico ref
  const [dragX, setDragX] = useStateS(0);
  const [snapBack, setSnapBack] = useStateS(false);

  useEffectS(() => {
    const el = listRef.current;
    if (!el) return;

    const start = (e) => {
      g.current = { x0: e.touches[0].clientX, y0: e.touches[0].clientY, axis: null };
      setSnapBack(false);
    };

    const move = (e) => {
      const dx = e.touches[0].clientX - g.current.x0;
      const dy = e.touches[0].clientY - g.current.y0;
      if (!g.current.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        g.current.axis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }
      if (g.current.axis !== 'h') return;
      e.preventDefault();         // blocca lo scroll mentre si swipe orizzontale
      setDragX(dx * 0.3);         // resistenza: il contenuto segue al 30%
    };

    const end = (e) => {
      if (g.current.axis !== 'h') return;
      const dx = e.changedTouches[0].clientX - g.current.x0;
      setSnapBack(true);
      setDragX(0);
      if (dx < -55) setTab('liberi');      // swipe sinistra → Liberi
      else if (dx > 55) setTab('attivi'); // swipe destra  → Occupati
      g.current.axis = null;
    };

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove',  move,  { passive: false });
    el.addEventListener('touchend',   end,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove',  move);
      el.removeEventListener('touchend',   end);
    };
  }, []);   // setTab è stabile, tutto il resto passa via ref

  const matches = (t) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    if (String(t.n).includes(needle)) return true;
    if (t.prenotazione?.nome?.toLowerCase().includes(needle)) return true;
    if (t.cameriere?.toLowerCase().includes(needle)) return true;
    return false;
  };

  // Tavoli dallo store condiviso: le azioni si riflettono ovunque.
  const { attivi: tavoliAttivi, liberi: tavoliLiberi, store } = useTavoli();
  const segnaConsegnato = (id) => store.segnaConsegnato(id);
  const segnaPiattoConsegnato = (id, idx) => store.segnaPiattoConsegnato(id, idx);
  const segnaPulito = (id) => store.segnaPulito(id);

  // Priorità in lista: prima i piatti pronti da servire, poi gli ordini da
  // approvare, infine il resto.
  const prioritaTavolo = (t) => {
    if (STAFF_SETTINGS.tracciaConsegne && t.pronti > 0) return 0;
    if (t.daInviare > 0) return 1;
    return 2;
  };
  const tavoli = tavoliAttivi.filter(matches)
    .sort((a, b) => prioritaTavolo(a) - prioritaTavolo(b));

  // Sezione Liberi come to-do: prima i "da pulire" (capacità bloccata da
  // un'azione rapida), poi i prenotati ordinati per imminenza, infine i
  // liberi pronti all'uso. I da-pulire restano qui — non hanno clienti né
  // servizio in corso, quindi non sono "Occupati": sono liberi in attesa.
  const prioritaLibero = (t) =>
    t.stato === 'da-pulire' ? 0 : t.stato === 'prenotato' ? 1 : 2;
  const liberi = tavoliLiberi.filter(matches).sort((a, b) => {
    const d = prioritaLibero(a) - prioritaLibero(b);
    if (d !== 0) return d;
    if (a.stato === 'prenotato') return minutiPrenotazione(a) - minutiPrenotazione(b);
    return 0;
  });

  return (
    <div style={{ background: ST.BG, minHeight: '100%' }}>
      {/* Header — sticky: rimane visibile durante lo scroll */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: 'calc(20px + env(safe-area-inset-top)) 20px 0', background: '#fff',
        borderBottom: `1px solid ${ST.BORDER_SOFT}`,
      }}>
        {/* Titolo + notifiche */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          {/* Sala + freccia cambio sala */}
          <button onClick={() => openModal({ kind: 'scelta-sala', sale: SALE, salaCorrente: salaSel, onCambia: setSalaSel })} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.5 }}>Sala</span>
              <I.ChevDown s={18} c={ST.MUTED}/>
            </div>
            <div style={{ fontSize: 12, color: ST.MUTED, fontWeight: 600, marginTop: 1 }}>{salaSel.nome}</div>
          </button>
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
        </div>

        {/* Tab segmented */}
        <div style={{
          display: 'flex', background: ST.SURF_ALT, borderRadius: ST.R_PILL,
          padding: 3, marginBottom: 10,
        }}>
          {[
            { id: 'attivi', label: 'Occupati', count: tavoli.length },
            { id: 'liberi', label: 'Liberi',   count: liberi.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, height: 38, borderRadius: ST.R_PILL, border: 'none',
              background: tab === t.id ? '#fff' : 'transparent',
              boxShadow: tab === t.id ? ST.SH_SM : 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
              <span style={{
                fontSize: 16.5, fontWeight: tab === t.id ? 700 : 600,
                color: tab === t.id ? ST.TEXT : ST.MUTED,
              }}>{t.label}</span>
              <span style={{
                fontSize: 12.5, fontWeight: 400,
                color: tab === t.id ? ST.MUTED : ST.MUTED_2,
              }}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* Dots: indicatore visivo swipe sinistra/destra */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, margin: '6px 0 8px' }}>
          {['attivi', 'liberi'].map(id => (
            <div key={id} style={{
              height: 5, borderRadius: 3,
              width: tab === id ? 18 : 5,
              background: tab === id ? ST.TEXT : ST.MUTED_3,
              transition: 'width 220ms ease, background 220ms ease',
            }}/>
          ))}
        </div>

        {/* Ricerca — sempre visibile subito sotto i tab */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          background: ST.SURF_ALT, borderRadius: ST.R_PILL, padding: '0 14px', height: 38,
        }}>
          <I.Search s={15} c={ST.MUTED}/>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cerca tavolo o nome…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 13.5,
              fontFamily: 'inherit', color: ST.TEXT,
            }}/>
          {q && (
            <button onClick={() => setQ('')} style={{
              width: 22, height: 22, borderRadius: ST.R_PILL, border: 'none',
              background: 'rgba(0,0,0,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.Close s={11}/></button>
          )}
        </div>
      </div>

      {/* Lista — area swipe */}
      <div ref={listRef} style={{
        padding: '14px 16px 110px', display: 'flex', flexDirection: 'column', gap: 12,
        transform: `translateX(${dragX}px)`,
        transition: snapBack ? 'transform 280ms cubic-bezier(.2,.8,.2,1)' : 'none',
        willChange: 'transform',
      }}>
        {tab === 'attivi' && tavoli.length === 0 && (
          <div style={{padding:'40px 20px', textAlign:'center', color: ST.MUTED, fontSize: 13.5}}>
            Nessun tavolo trovato per "{q}"
          </div>
        )}
        {tab === 'liberi' && liberi.length === 0 && q && (
          <div style={{padding:'40px 20px', textAlign:'center', color: ST.MUTED, fontSize: 13.5}}>
            Nessun tavolo trovato per "{q}"
          </div>
        )}
        {tab === 'attivi'
          ? tavoli.map(t => <TavoloCardAttivo key={t.id} t={t} onOpen={() => nav.push({ s: 'tavolo', id: t.id })} onActions={() => openModal({ kind: 'tavolo-actions', tavolo: t })} onConsegnato={() => segnaConsegnato(t.id)} onConsegnatoPiatto={(idx) => segnaPiattoConsegnato(t.id, idx)} onApprova={() => nav.push({ s: 'tavolo', id: t.id })}/>)
          : liberi.map(t => <TavoloCardLibero
              key={t.id}
              t={t}
              onAttiva={() => openModal({ kind: 'attiva-tavolo', tavolo: t })}
              onModificaTavolo={() => openModal({ kind: 'modifica-tavolo', tavolo: t, scope: 'libero' })}
              onCoperti={(n) => store.setCopertiLibero(t.id, n)}
              onModificaPrenotazione={() => openModal({ kind: 'modifica-prenotazione', tavolo: t })}
              onPulito={() => segnaPulito(t.id)}
              onMore={() => openModal({ kind: 'libero-actions', tavolo: t })}
            />)}

        {tab === 'liberi' && (
          <button onClick={() => openModal({ kind: 'attiva-tavolo' })} style={{
            marginTop: 12, height: 56, borderRadius: ST.R_LG, border: `2px dashed ${ST.MUTED_3}`,
            background: 'transparent', color: ST.MUTED, fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <I.Plus s={18} c={ST.MUTED}/> Attiva un tavolo libero
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Card tavolo ATTIVO ─────────────────────────────────────
// Banner di alert in cima alla card (riutilizzabile per i vari tipi)
function CardAlert({ bg, icon, text, actionLabel, onAction }) {
  return (
    <div style={{
      background: bg, color: '#fff', padding: '8px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700 }}>
        {icon} {text}
      </span>
      <button onClick={(e) => { e.stopPropagation(); onAction(); }} style={{
        border: 'none', background: 'rgba(255,255,255,0.22)', color: '#fff',
        borderRadius: ST.R_PILL, padding: '5px 12px', flexShrink: 0,
        fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
      }}>{actionLabel}</button>
    </div>
  );
}

function TavoloCardAttivo({ t, onOpen, onActions, onConsegnato, onConsegnatoPiatto, onApprova }) {
  const [prontiOpen, setProntiOpen] = useStateS(false);
  const haPronti = STAFF_SETTINGS.tracciaConsegne && t.pronti > 0;
  const daApprovare = t.daInviare > 0;
  const borderColor = haPronti ? ST.PINK_DARK : daApprovare ? ST.ST_BOOKED : ST.BORDER_SOFT;
  // Numero tavolo: più tavoli uniti => testo più piccolo (min 18), poi ellissi.
  const nLen = String(t.n).length;
  const nFont = nLen <= 6 ? 30 : nLen <= 12 ? 24 : 18;
  return (
    <div style={{
      background: '#fff', borderRadius: ST.R_LG, overflow: 'hidden',
      boxShadow: ST.SH_SM,
      border: `${(haPronti || daApprovare) ? '1.5px' : '1px'} solid ${borderColor}`,
    }}>
      {/* Alert: ordine del tavolo da approvare e inviare in cucina */}
      {daApprovare && (
        <CardAlert
          bg={ST.ST_BOOKED}
          icon={<I.Receipt s={14} c="#fff"/>}
          text="Ordine da approvare"
          actionLabel="Vedi ordine"
          onAction={onApprova}
        />
      )}
      {/* Piatti pronti: header comprimibile + elenco senza immagine con
          consegna del singolo piatto, così il cameriere capisce cosa portare. */}
      {haPronti && (
        <>
          {/* Header: toggle apri/chiudi anteprima */}
          <div onClick={(e) => { e.stopPropagation(); setProntiOpen(o => !o); }} style={{
            background: ST.PINK_DARK, color: '#fff', padding: '8px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            cursor: 'pointer',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700 }}>
              <I.Bell s={14} c="#fff"/> <span>{t.pronti}</span> <span>Da consegnare</span>
            </span>
            <I.ChevDown s={16} c="#fff" style={{ transform: prontiOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms' }}/>
          </div>
          {/* Elenco piatti pronti: ogni riga si segna come consegnato */}
          {prontiOpen && t.piattiPronti?.length > 0 && (
            <div style={{
              padding: '10px 14px', background: ST.PINK_SOFT,
              borderBottom: `1px solid ${ST.BORDER_SOFT}`,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {t.piattiPronti.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    minWidth: 32, height: 26, padding: '0 7px', borderRadius: 7,
                    background: '#fff', color: ST.PINK_DARK,
                    fontSize: 13, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{p.qty}×</span>
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: ST.TEXT }}>{p.nome}</span>
                  <button onClick={(e) => { e.stopPropagation(); onConsegnatoPiatto(i); }} style={{
                    height: 36, padding: '0 14px', borderRadius: ST.R_PILL, border: 'none',
                    background: ST.PINK_DARK, color: '#fff',
                    fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  }}>
                    <I.Check s={14} c="#fff"/> Consegna
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div onClick={onOpen} style={{
        padding: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Gerarchia massima: numero tavolo (si adatta e va in ellissi) */}
          <div style={{
            fontSize: nFont, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.6, lineHeight: 1.05,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Tavolo {t.n}
          </div>
          {/* Gerarchia minima: saldo */}
          <div style={{ fontSize: 11, color: ST.MUTED, marginTop: 6, fontWeight: 600 }}>
            Saldo €{t.saldo}
          </div>
        </div>
        {/* Modifiche del tavolo: coperti, unisci/dividi, libera */}
        <button onClick={(e) => { e.stopPropagation(); onActions(); }} aria-label="Modifica tavolo" style={{
          width: 40, height: 40, borderRadius: ST.R_PILL, flexShrink: 0,
          border: `1.5px solid ${ST.BORDER}`, background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I.More s={20}/>
        </button>
      </div>
    </div>
  );
}

// ─── Card tavolo LIBERO/PRENOTATO/DA-PULIRE ────────────────
function TavoloCardLibero({ t, onAttiva, onModificaTavolo, onCoperti, onModificaPrenotazione, onPulito, onMore }) {
  const isPrenotato = t.stato === 'prenotato';
  const isDaPulire = t.stato === 'da-pulire';
  const isLibero = !isPrenotato && !isDaPulire;
  const isComposto = String(t.n).includes('-');
  const imminente = isPrenotato && minutiPrenotazione(t) < 45;
  const hasTags = isPrenotato && t.prenotazione.tags?.length > 0;
  const hasNote = isPrenotato && !!t.prenotazione.note;

  // Palette per stato
  const PU = '#7C3AED';
  const PU_BG = '#FAF5FF';
  const PU_CHIP = '#EDE9FE';
  const PU_CHIP_T = '#6D28D9';
  const PU_BORDER = imminente ? '#A855F7' : '#DDD6FE';
  const GR_BG = '#F8FAFC';
  const GR_BORDER = '#CBD5E1';
  const GR_SEP = '#E2E8F0';
  const YE_BG = '#FFFBEB';      // giallo card da-pulire
  const YE_BORDER = '#FCD34D';  // giallo bordo

  const cardBg = isLibero ? GR_BG : isPrenotato ? PU_BG : isDaPulire ? YE_BG : '#fff';
  const cardBorder = isLibero ? GR_BORDER : isPrenotato ? PU_BORDER : isDaPulire ? YE_BORDER : ST.BORDER_SOFT;
  const nFont = String(t.n).length <= 6 ? 17 : String(t.n).length <= 12 ? 15 : 13;

  return (
    <div style={{
      background: cardBg, borderRadius: ST.R_LG, overflow: 'hidden',
      boxShadow: ST.SH_SM,
      border: `${(isLibero || imminente) ? '1.5px' : '1px'} solid ${cardBorder}`,
    }}>
      {/* Banner viola imminente — tappabile per gestire la prenotazione */}
      {imminente && (
        <div onClick={onModificaPrenotazione} style={{
          background: PU, color: '#fff', padding: '8px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, minWidth: 0 }}>
            <I.Clock s={14} c="#fff"/>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Prenotazione tra {t.prenotazione.quando} · {t.prenotazione.nome}
            </span>
          </span>
          <I.ChevRight s={16} c="#fff"/>
        </div>
      )}

      <div style={{ padding: 14 }}>
        {/* Numero + chip + tre-puntini */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusDot stato={t.stato}/>
          <span style={{
            fontSize: nFont, fontWeight: 800, color: ST.TEXT, flex: 1, minWidth: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Tavolo {t.n}
          </span>
          {isDaPulire && <Chip color="#D97706" bg="#FEF3C7">Da pulire</Chip>}
          {!isDaPulire && (
            <button onClick={(e) => { e.stopPropagation(); onMore(); }} aria-label="Azioni" style={{
              width: 34, height: 34, borderRadius: ST.R_PILL, flexShrink: 0,
              border: `1.5px solid ${cardBorder}`, background: 'rgba(255,255,255,0.75)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I.More s={17}/>
            </button>
          )}
        </div>

        {/* Prenotato non imminente: chip orario viola */}
        {isPrenotato && !imminente && (
          <div style={{
            marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', background: PU_CHIP, color: PU_CHIP_T,
            borderRadius: ST.R_PILL, fontSize: 11.5, fontWeight: 600,
          }}>
            <I.Clock s={11} c={PU_CHIP_T}/> {t.prenotazione.nome} · tra {t.prenotazione.quando}
          </div>
        )}

        {/* Tag evento + note */}
        {(hasTags || hasNote) && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {hasTags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {t.prenotazione.tags.map(tag => (
                  <Chip key={tag} color={PU_CHIP_T} bg={PU_CHIP}>{tag}</Chip>
                ))}
              </div>
            )}
            {hasNote && (
              <div style={{ fontSize: 11.5, color: ST.MUTED, fontStyle: 'italic', lineHeight: 1.4 }}>
                {t.prenotazione.note}
              </div>
            )}
          </div>
        )}

        {isDaPulire ? (
          <button onClick={onPulito} style={{
            width: '100%', height: 42, borderRadius: ST.R_PILL, marginTop: 12,
            border: `1.5px solid ${YE_BORDER}`, background: '#fff', color: ST.TEXT,
            fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <I.Check s={16} c={ST.TEXT}/> Segna come pulito
          </button>
        ) : (
          <>
            {/* Posti: sfondo bianco + bordo cromatico per staccarsi dalla card */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: '#fff', borderRadius: ST.R_MD, marginTop: 12,
              border: `1px solid ${isLibero ? GR_BORDER : PU_BORDER}`,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: ST.TEXT }}>
                <I.Chair s={15} c={ST.MUTED}/> Posti
              </span>
              <Stepper value={t.coperti} onChange={onCoperti}/>
            </div>

            {/* Separatore + CTA primaria unica */}
            <div style={{
              marginTop: 16, paddingTop: 14,
              borderTop: `1px solid ${isLibero ? GR_SEP : PU_CHIP}`,
            }}>
              {isPrenotato && !imminente ? (
                <Btn variant="secondary" full onClick={onModificaPrenotazione}>
                  Modifica prenotazione
                </Btn>
              ) : (
                <Btn variant="primary" full onClick={onAttiva}>
                  <I.Walk s={16} c="#fff"/> Attiva tavolo
                </Btn>
              )}
            </div>
          </>
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
      <div style={{ padding: 'calc(20px + env(safe-area-inset-top)) 20px 24px', background: '#fff' }}>
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
