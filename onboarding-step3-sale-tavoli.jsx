// Step 3 — Sale e tavoli (vivace).
// Hero illustration sala vista dall'alto, accent color cycling per ogni sala,
// table dots con numero, counter animato, micro-copy posti.

function Step3SaleTavoli({rooms, setRooms, onNext, onBack}) {
  const totalTables = rooms.reduce((sum, r) => sum + r.tables, 0);

  const addRoom = () => {
    setRooms(rs => [...rs, {
      id: `r${Date.now()}`,
      name: 'Nuova sala',
      tables: 0,                  // 0 → forza l'utente a configurare → mostra empty state
      isDefault: false,
    }]);
  };
  const removeRoom = (id) => setRooms(rs => rs.filter(r => r.id !== id));
  const updateRoom = (id, key, val) =>
    setRooms(rs => rs.map(r => r.id === id ? {...r, [key]: val} : r));

  return (
    <div style={{
      padding: '40px 48px 64px',
      background: ONB.BG_SOFT,
      minHeight: 760,
    }}>
      <div style={{maxWidth: 880, margin: '0 auto'}}>

        {/* Hero — illustrazione + copy. Layout flex per integrare sala-illustration
            (planimetria astratta) col headline. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          marginBottom: 32,
        }}>
          <SalaHeroIllustration/>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 500, color: ONB.MUTED,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Step 3 di 4
            </div>
            <h1 style={{
              fontSize: 32, fontWeight: 600, lineHeight: 1.2,
              letterSpacing: '-0.02em', margin: '0 0 8px', color: ONB.TEXT,
            }}>
              Disegna le tue sale.
            </h1>
            <p style={{
              fontSize: 16, fontWeight: 400, lineHeight: 1.4,
              color: ONB.MUTED, margin: 0, maxWidth: 540,
            }}>
              Aggiungi le sale del locale e quanti tavoli ospita ciascuna.
              Generiamo un QR univoco per ogni tavolo — stampalo e attaccalo.
            </p>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          marginBottom: 16, padding: '16px 20px',
          background: '#fff',
          border: '1px solid rgba(15, 17, 21, 0.08)', borderRadius: 10,
        }}>
          <SummaryStat label="Sale" value={rooms.length}/>
          <div style={{width: 1, height: 32, background: 'rgba(15, 17, 21, 0.08)'}}/>
          <SummaryStat label="Tavoli totali" value={totalTables}/>
          <div style={{width: 1, height: 32, background: 'rgba(15, 17, 21, 0.08)'}}/>
          <SummaryStat label="QR code da generare" value={totalTables}/>
        </div>

        {/* Rooms list */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {rooms.map((r, i) => (
            <RoomCard
              key={r.id}
              room={r}
              index={i}
              accent={ONB.ROOM_ACCENTS[i % ONB.ROOM_ACCENTS.length]}
              onUpdate={(k, v) => updateRoom(r.id, k, v)}
              onRemove={() => removeRoom(r.id)}
            />
          ))}
        </div>

        {/* Add room */}
        <button onClick={addRoom} style={{
          marginTop: 12,
          width: '100%', padding: '14px 20px',
          background: 'transparent',
          border: '1.5px dashed rgba(15, 17, 21, 0.16)',
          borderRadius: 10,
          fontSize: 14, fontWeight: 500, color: ONB.TEXT, fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'border-color 150ms ease-out',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(15, 17, 21, 0.32)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(15, 17, 21, 0.16)'}
        >
          <OnbIcon.Plus size={14} color={ONB.TEXT}/>
          Aggiungi sala
        </button>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 32, paddingTop: 24,
          borderTop: '1px solid rgba(15, 17, 21, 0.08)',
        }}>
          <SecondaryCta onClick={onBack}>
            <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
            Indietro
          </SecondaryCta>
          <PrimaryCta onClick={onNext} disabled={rooms.length === 0 || totalTables === 0}>
            Continua
            <OnbIcon.ArrowRight size={14} color="#fff"/>
          </PrimaryCta>
        </div>
      </div>

      {/* CSS keyframes per l'animazione del counter (Task 5).
          Bump 1→1.15→1 in 150ms — "scale" è ammesso eccezionalmente qui
          come microinterazione di feedback al cambio valore. */}
      <style>{`
        @keyframes counter-bump {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .counter-value {
          display: inline-block;
          transform-origin: center center;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SalaHeroIllustration — planimetria astratta sala vista dall'alto.
// Forme geometriche essenziali: 4 tavoli + sedie + banco. Una sola colorazione
// brand sul tavolo top-left per agganciare visualmente alle Room cards
// (anch'esse usano accent colors in cycling).
// ─────────────────────────────────────────────────────────────────────────

function SalaHeroIllustration() {
  const stroke = 'rgba(15, 17, 21, 0.16)';
  const seat   = 'rgba(15, 17, 21, 0.32)';
  return (
    <svg
      width="120" height="80" viewBox="0 0 120 80"
      style={{flexShrink: 0}}
      aria-hidden="true"
    >
      {/* Tavolo top-left con accent BRAND — è il "tavolo demo" che ti fa
          intuire come il sistema ti rappresenterà ogni sala. */}
      <g>
        <rect x="12" y="14" width="22" height="14" rx="3"
          fill={ONB.BRAND_SOFT} stroke={ONB.BRAND} strokeWidth="1"/>
        <circle cx="11" cy="21" r="2.5" fill={ONB.BRAND}/>
        <circle cx="35" cy="21" r="2.5" fill={ONB.BRAND}/>
        <circle cx="23" cy="11" r="2.5" fill={ONB.BRAND}/>
        <circle cx="23" cy="31" r="2.5" fill={ONB.BRAND}/>
      </g>

      {/* Tavoli neutri — 3 in pattern ordinato. Ricordano una sala configurata. */}
      {[
        {tx: 50, ty: 14}, {tx: 12, ty: 40}, {tx: 50, ty: 40},
      ].map((t, i) => (
        <g key={i}>
          <rect x={t.tx} y={t.ty} width="22" height="14" rx="3" fill="#fff" stroke={stroke} strokeWidth="1"/>
          <circle cx={t.tx - 1}  cy={t.ty + 7} r="2.5" fill={seat}/>
          <circle cx={t.tx + 23} cy={t.ty + 7} r="2.5" fill={seat}/>
          <circle cx={t.tx + 11} cy={t.ty - 3} r="2.5" fill={seat}/>
          <circle cx={t.tx + 11} cy={t.ty + 17} r="2.5" fill={seat}/>
        </g>
      ))}

      {/* Banco / bar — barretta verticale a destra */}
      <rect x="86" y="20" width="6" height="44" rx="2" fill="rgba(15, 17, 21, 0.10)"/>
      {/* Linea di passaggio camerieri — tratteggiata, simboleggia il flow */}
      <line x1="100" y1="40" x2="116" y2="40" stroke="rgba(15, 17, 21, 0.16)" strokeDasharray="2 2" strokeWidth="0.8"/>
    </svg>
  );
}

function SummaryStat({label, value}) {
  return (
    <div>
      <div style={{
        fontSize: 24, fontWeight: 600, color: ONB.TEXT,
        lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 12, fontWeight: 500, color: ONB.MUTED,
        marginTop: 6, lineHeight: 1.4,
      }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// RoomCard — riga sala con accent color, counter animato, table grid o empty state.
// Left border 4px del colore accent → identificazione immediata di ogni sala.
// ─────────────────────────────────────────────────────────────────────────

function RoomCard({room, index, accent, onUpdate, onRemove}) {
  const seats = room.tables * 4;       // default 4 posti per tavolo
  const isEmpty = room.tables === 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 200px auto',
      gap: 20, alignItems: 'flex-start',
      padding: 20,
      background: '#fff',
      // Card neutra coerente col sistema (no left-border accent).
      // L'identità sala vive nel dot 8px dell'header + colore counter + table dots.
      border: '1px solid rgba(15, 17, 21, 0.06)',
      borderRadius: 12,
      boxShadow: '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 16px rgba(15, 17, 21, 0.03)',
    }}>
      {/* Colonna principale — header sala + table grid o empty state */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8,
        }}>
          {/* Dot accent — unico identificatore visivo della sala dopo la rimozione
              della left-border. Coordinato col counter color e con i table dots. */}
          <span style={{
            width: 8, height: 8, borderRadius: 999,
            background: accent.fg, flexShrink: 0,
          }}/>
          <span style={{
            fontSize: 12, fontWeight: 500, color: ONB.MUTED,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Sala {index + 1}
          </span>
          {room.isDefault && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: ONB.BG, color: ONB.MUTED,
              fontSize: 10, fontWeight: 500, letterSpacing: '0.04em',
              border: '1px solid rgba(15, 17, 21, 0.08)',
            }}>
              Principale
            </span>
          )}
        </div>

        <input
          value={room.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          style={{
            width: '100%', height: 40, padding: '0 12px',
            border: '1px solid rgba(15, 17, 21, 0.10)',
            borderRadius: 8,
            fontSize: 15, fontWeight: 500, color: ONB.TEXT,
            fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 150ms ease-out',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = accent.fg}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(15, 17, 21, 0.10)'}
        />

        {isEmpty ? (
          <EmptyTablesState accent={accent} onAdd={() => onUpdate('tables', 1)}/>
        ) : (
          <TableGrid count={room.tables} accent={accent}/>
        )}
      </div>

      {/* Counter tavoli + micro-copy posti */}
      <div>
        <div style={{
          fontSize: 12, fontWeight: 500, color: ONB.MUTED,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Tavoli
        </div>
        <Counter
          value={room.tables}
          onChange={(v) => onUpdate('tables', v)}
          min={0}
          accent={accent}
        />
        {/* Micro-copy: "Tavoli configurati" sostituito da "Perfetto per una sala da X posti".
            Più caldo + comunica una conseguenza utile (capacità). Ammesso il calcolo
            "× 4" come default standard del settore (ristoranti italiani 4 coperti/tavolo). */}
        <div style={{
          marginTop: 8,
          fontSize: 12, fontWeight: 400, color: ONB.MUTED,
          lineHeight: 1.4,
        }}>
          {isEmpty
            ? 'Aggiungi almeno un tavolo'
            : <>Perfetto per una sala da <span style={{
                fontWeight: 600, color: ONB.TEXT, fontVariantNumeric: 'tabular-nums',
              }}>{seats} posti</span></>}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        disabled={room.isDefault}
        aria-label={room.isDefault ? 'La sala principale non può essere rimossa' : 'Rimuovi sala'}
        title={room.isDefault ? 'La sala principale non può essere rimossa' : 'Rimuovi sala'}
        style={{
          alignSelf: 'flex-start', marginTop: 22,
          width: 36, height: 36,
          background: 'transparent', border: 'none',
          borderRadius: 8,
          cursor: room.isDefault ? 'not-allowed' : 'pointer',
          opacity: room.isDefault ? 0.3 : 1,
          color: ONB.MUTED,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 150ms ease-out',
        }}
        onMouseEnter={(e) => { if (!room.isDefault) e.currentTarget.style.background = ONB.BG; }}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <OnbIcon.Trash size={16} color={ONB.MUTED}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Counter — −/+ con animazione bump al cambio valore.
// key={value} sullo span forza un remount → l'animation CSS riparte ogni volta.
// ─────────────────────────────────────────────────────────────────────────

function Counter({value, onChange, min = 0, max = 200, accent}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      height: 40,
      border: '1px solid rgba(15, 17, 21, 0.10)',
      borderRadius: 8, background: '#fff',
    }}>
      <CounterButton onClick={dec} disabled={value <= min} ariaLabel="Diminuisci">−</CounterButton>
      <div style={{
        flex: 1, height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontVariantNumeric: 'tabular-nums', position: 'relative',
      }}>
        <span
          key={value}
          className="counter-value"
          style={{
            fontSize: 16, fontWeight: 600, color: accent ? accent.fg : ONB.TEXT,
            animation: 'counter-bump 150ms ease-out',
          }}
        >
          {value}
        </span>
      </div>
      <CounterButton onClick={inc} disabled={value >= max} ariaLabel="Aumenta">+</CounterButton>
    </div>
  );
}

function CounterButton({onClick, disabled, ariaLabel, children}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        width: 36, height: '100%',
        border: 'none', background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        color: ONB.TEXT,
        fontSize: 18, fontWeight: 500, fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TableGrid — dot 14×14 con numero tavolo dentro. Colore = accent della sala.
// ─────────────────────────────────────────────────────────────────────────

function TableGrid({count, accent}) {
  const items = Array.from({length: Math.min(count, 48)}, (_, i) => i + 1);
  const overflow = count > 48 ? count - 48 : 0;
  return (
    <div style={{
      marginTop: 12,
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 14px)',
      gap: 6,
    }}>
      {items.map(n => (
        <div key={n} style={{
          width: 14, height: 14, borderRadius: 999,
          background: accent.soft,
          border: `1px solid ${accent.fg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 600, color: accent.fg,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>
          {n}
        </div>
      ))}
      {overflow > 0 && (
        <span style={{
          gridColumn: 'span 4',
          fontSize: 11, color: ONB.MUTED, lineHeight: '14px',
          paddingLeft: 4,
        }}>
          +{overflow} altri
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// EmptyTablesState — mostrato quando una sala ha 0 tavoli.
// Copy caldo, icona tavolo dashed, CTA "+ Aggiungi tavolo".
// ─────────────────────────────────────────────────────────────────────────

function EmptyTablesState({accent, onAdd}) {
  return (
    <div style={{
      marginTop: 12,
      padding: '20px 16px',
      background: accent.soft,
      borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <EmptyTableIcon color={accent.fg}/>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: ONB.TEXT, lineHeight: 1.4,
        }}>
          Nessun tavolo ancora
        </div>
        <div style={{
          fontSize: 13, fontWeight: 400, color: ONB.MUTED, lineHeight: 1.4,
          marginTop: 2,
        }}>
          Aggiungi i tavoli di questa sala — ci vogliono 30 secondi.
        </div>
      </div>
      <button onClick={onAdd} style={{
        height: 36, padding: '0 14px',
        background: '#fff', color: accent.fg,
        border: `1px solid ${accent.fg}`,
        borderRadius: 8, fontFamily: 'inherit',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'background 150ms ease-out',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = accent.soft}
      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
      >
        <OnbIcon.Plus size={12} color={accent.fg}/>
        Aggiungi tavolo
      </button>
    </div>
  );
}

function EmptyTableIcon({color}) {
  return (
    <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true" style={{flexShrink: 0}}>
      <rect x="14" y="20" width="32" height="20" rx="3"
        fill="none" stroke={color} strokeOpacity="0.5"
        strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="13" cy="30" r="3" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 1.5"/>
      <circle cx="47" cy="30" r="3" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 1.5"/>
      <circle cx="30" cy="17" r="3" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 1.5"/>
      <circle cx="30" cy="43" r="3" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 1.5"/>
    </svg>
  );
}

window.Step3SaleTavoli = Step3SaleTavoli;
