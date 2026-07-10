// Cucina / KDS — ticket comanda in VETRO SCURO (ricetta D3 sunset).
// Priorità/ritardo = accento coral/ambra TRASLUCIDO + tempo trascorso,
// mai fondi rossi pieni. Piatti in tipografia grande leggibile a distanza,
// stati item come pill di vetro, avanzamento a barra sottile.
//
//   <KdsTicket t={ticket} now={minuti} onItemTap={(idx)=>...}/>

function kdsToMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const KDS_C = {
  text: '#F5F5F7',
  sub:  'rgba(245, 245, 247, 0.62)',
  mut:  'rgba(245, 245, 247, 0.40)',
  hair: 'rgba(255, 255, 255, 0.08)',
};

// Palette LIGHT — board chiara, il dark resta solo sulle card in ritardo
const KDS_CL = {
  text: '#0F1115',
  sub:  'rgba(15, 17, 21, 0.62)',
  mut:  'rgba(15, 17, 21, 0.40)',
  hair: 'rgba(15, 17, 21, 0.07)',
};

// Toni traslucidi — l'urgenza è un accento, non un fondo
const KDS_TONE = {
  ok:    { tint: 'rgba(255, 255, 255, 0.07)', ring: 'rgba(255, 255, 255, 0.14)', ink: 'rgba(245,245,247,0.72)', dot: 'rgba(245,245,247,0.45)' },
  warn:  { tint: 'rgba(245, 158, 11, 0.16)',  ring: 'rgba(245, 158, 11, 0.42)',  ink: '#FFC964', dot: '#F59E0B' },
  late:  { tint: 'rgba(255, 90, 95, 0.18)',   ring: 'rgba(255, 90, 95, 0.48)',   ink: '#FF9A9E', dot: '#FF5A5F' },
  doing: { tint: 'rgba(245, 158, 11, 0.14)',  ring: 'rgba(245, 158, 11, 0.36)',  ink: '#FFC964', dot: '#F59E0B' },
  done:  { tint: 'rgba(52, 211, 153, 0.14)',  ring: 'rgba(52, 211, 153, 0.40)',  ink: '#6EE7B7', dot: '#34D399' },
};

// Toni per tema light — stessi ruoli, ink scuri leggibili su bianco
const KDS_TONE_L = {
  ok:    { tint: 'rgba(15, 17, 21, 0.05)',   ring: 'rgba(15, 17, 21, 0.10)',   ink: 'rgba(15,17,21,0.60)', dot: 'rgba(15,17,21,0.30)' },
  warn:  { tint: 'rgba(245, 158, 11, 0.12)', ring: 'rgba(245, 158, 11, 0.38)', ink: '#B45309', dot: '#F59E0B' },
  late:  { tint: 'rgba(220, 38, 38, 0.10)',  ring: 'rgba(220, 38, 38, 0.38)',  ink: '#DC2626', dot: '#DC2626' },
  doing: { tint: 'rgba(245, 158, 11, 0.10)', ring: 'rgba(245, 158, 11, 0.32)', ink: '#B45309', dot: '#F59E0B' },
  done:  { tint: 'rgba(16, 185, 129, 0.10)', ring: 'rgba(16, 185, 129, 0.35)', ink: '#059669', dot: '#10B981' },
};

const KDS_ITEM_PILL = {
  todo:  { label: 'Nuovo',   tone: 'ok' },
  doing: { label: 'In prep', tone: 'doing' },
  done:  { label: 'Pronto',  tone: 'done' },
};

const KDS_COURSE_LABEL = { 1: 'Antipasti', 2: 'Primi', 3: 'Secondi', 4: 'Dessert' };

// Pill di vetro — tinta traslucida + hairline ring (light per la board chiara)
function KdsPill({ tone = 'ok', light = false, children, style }) {
  const m = (light ? KDS_TONE_L : KDS_TONE)[tone] || (light ? KDS_TONE_L.ok : KDS_TONE.ok);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: m.tint,
      boxShadow: `inset 0 0 0 1px ${m.ring}`,
      color: m.ink,
      fontSize: 11.5, fontWeight: 700, lineHeight: 1.3,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
      maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
      ...style,
    }}>
      <span style={{width: 5.5, height: 5.5, borderRadius: '50%', background: m.dot, flexShrink: 0}}/>
      {children}
    </span>
  );
}

function KdsTicket({ t, now, onItemTap, selected, style, children }) {
  const nowMin = now != null ? now : (window.CUC_NOW_MIN || 0);
  const age = Math.max(0, nowMin - kdsToMin(t.time));
  const isPickup = (t.kind === 'asporto' || t.kind === 'delivery') && t.pickup;
  const minToPickup = isPickup ? kdsToMin(t.pickup) - nowMin : null;
  const tone = isPickup
    ? (minToPickup > 15 ? 'ok' : minToPickup > 5 ? 'warn' : 'late')
    : (age <= 8 ? 'ok' : age <= 15 ? 'warn' : 'late');
  const tm = KDS_TONE[tone];

  const total = t.items.reduce((s, i) => s + i.qty, 0);
  const doneN = t.items.reduce((s, i) => s + (i.state === 'done' ? i.qty : 0), 0);
  const pct = total > 0 ? (doneN / total) * 100 : 0;
  const allDone = doneN === total && total > 0;

  const title = t.kind === 'sala' ? null : (t.customer || 'Cliente');
  const kindLabel = t.kind === 'asporto' ? 'Asporto' : t.kind === 'delivery' ? 'Delivery' : null;

  // Hairline d'urgenza: solo quando warn/late il ring interno si scalda
  const urgencyRing = tone === 'ok'
    ? 'inset 0 0 0 1px rgba(255, 130, 150, 0.12)'
    : `inset 0 0 0 1px ${tm.ring}`;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      // Ricetta D3: vetro scuro + inset specular caldo
      background: 'rgba(20, 22, 27, 0.55)',
      backdropFilter: 'blur(22px) saturate(170%)',
      WebkitBackdropFilter: 'blur(22px) saturate(170%)',
      border: 'none',
      boxShadow: [
        'inset 0 1px 0 rgba(255, 200, 210, 0.18)',
        urgencyRing,
        selected ? '0 0 0 3px rgba(255, 90, 95, 0.40)' : null,
        '0 14px 36px -10px rgba(80, 10, 30, 0.55)',
        '0 4px 10px -4px rgba(80, 10, 30, 0.30)',
      ].filter(Boolean).join(', '),
      padding: '14px 16px 12px',
      color: KDS_C.text,
      display: 'flex', flexDirection: 'column', gap: 10,
      minWidth: 0,
      transition: 'box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      ...style,
    }}>

      {/* Header: chi + dove + tempo */}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 10}}>
        <div style={{flex: '1 1 0%', minWidth: 0}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 7, minWidth: 0}}>
            {t.kind === 'sala' ? (
              <span style={{fontSize: 23, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em'}}>
                <span style={{fontSize: 14, fontWeight: 700, color: KDS_C.mut, letterSpacing: '0.02em'}}>Tavolo </span>{t.table}
              </span>
            ) : (
              <span style={{
                fontSize: 19, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.01em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{title}</span>
            )}
            <span style={{fontSize: 12, fontWeight: 600, color: KDS_C.mut, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>{t.orderN}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, minWidth: 0}}>
            {kindLabel && (
              <span style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: KDS_C.sub, padding: '1px 7px', borderRadius: 999,
                background: 'rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                flexShrink: 0,
              }}>{kindLabel}</span>
            )}
            <span style={{fontSize: 12, fontWeight: 600, color: KDS_C.mut, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {t.station}{isPickup ? ` · ritiro ${t.pickup}` : ` · ${t.time}`}
            </span>
          </div>
        </div>

        {/* Tempo — il segnale d'urgenza: numero grande + tinta traslucida */}
        <div style={{
          flexShrink: 0, textAlign: 'center',
          padding: '6px 11px', borderRadius: 13,
          background: tm.tint,
          boxShadow: `inset 0 0 0 1px ${tm.ring}`,
        }}>
          <div style={{
            fontSize: 19, fontWeight: 800, lineHeight: 1, color: tm.ink,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          }}>
            {isPickup ? (minToPickup <= 0 ? 'ora' : `${minToPickup}′`) : `${age}′`}
          </div>
          <div style={{fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: tm.ink, opacity: 0.7, marginTop: 2}}>
            {isPickup ? 'al ritiro' : 'fa'}
          </div>
        </div>
      </div>

      {/* Hairline */}
      <div style={{height: 1, background: KDS_C.hair}}/>

      {/* Piatti — tipografia grande, leggibile a distanza */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        {t.items.map((it, idx) => {
          const pill = KDS_ITEM_PILL[it.state] || KDS_ITEM_PILL.todo;
          const isDone = it.state === 'done';
          const showCourse = it.course != null && (idx === 0 || t.items[idx - 1].course !== it.course);
          return (
            <React.Fragment key={idx}>
              {showCourse && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: idx === 0 ? '0 0 2px' : '8px 0 2px',
                }}>
                  <span style={{fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: KDS_C.mut}}>
                    {KDS_COURSE_LABEL[it.course] || `Portata ${it.course}`}
                  </span>
                  <span style={{flex: 1, height: 1, background: KDS_C.hair}}/>
                </div>
              )}
              <div
                onClick={onItemTap ? () => onItemTap(idx) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                  columnGap: 10, rowGap: 2,
                  padding: '6px 8px', margin: '0 -8px', borderRadius: 12,
                  cursor: onItemTap ? 'pointer' : 'default',
                  transition: 'background 150ms ease-out',
                }}
                onMouseEnter={e => { if (onItemTap) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                  color: isDone ? KDS_C.mut : '#FF9A9E',
                  minWidth: 26, flexShrink: 0,
                }}>{it.qty}×</span>
                <span style={{
                  flex: '1 1 0%', minWidth: '45%',
                  fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em',
                  color: isDone ? KDS_C.mut : KDS_C.text,
                  textDecoration: isDone ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{it.name}</span>
                <span style={{flex: '0 0 auto', marginLeft: 'auto', maxWidth: '100%', minWidth: 0, display: 'inline-flex'}}>
                  <KdsPill tone={pill.tone}>{pill.label}</KdsPill>
                </span>
                {(it.note || it.allergen) && (
                  <div style={{flexBasis: '100%', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 36, minWidth: 0}}>
                    {it.allergen && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                        color: '#FF9A9E', padding: '1px 7px', borderRadius: 999,
                        background: 'rgba(255, 90, 95, 0.16)',
                        boxShadow: 'inset 0 0 0 1px rgba(255, 90, 95, 0.45)',
                        textTransform: 'uppercase', flexShrink: 0,
                      }}>Allergia</span>
                    )}
                    {it.note && (
                      <span style={{
                        fontSize: 12.5, fontWeight: 500, color: KDS_C.sub,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{it.note}</span>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Avanzamento — barra sottile, mai blocchi saturi */}
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto'}}>
        <div style={{flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 2,
            background: allDone
              ? 'linear-gradient(90deg, #34D399, #6EE7B7)'
              : 'linear-gradient(90deg, #FF5A5F, #FB923C)',
            transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}/>
        </div>
        <span style={{fontSize: 11.5, fontWeight: 700, color: allDone ? '#6EE7B7' : KDS_C.mut, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>
          {doneN}/{total}
        </span>
      </div>

      {children}
    </div>
  );
}

window.KdsTicket = KdsTicket;
window.KdsPill = KdsPill;
window.KDS_TONE = KDS_TONE;
window.KDS_TONE_L = KDS_TONE_L;
window.KDS_C = KDS_C;
window.KDS_CL = KDS_CL;
