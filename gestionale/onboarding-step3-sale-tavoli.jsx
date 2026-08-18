// Step 3 — Sale e tavoli (vivace).
// Prima di tutto l'utente sceglie la modalità di servizio ("Ho sale e tavoli"
// vs "Faccio solo asporto"): la configurazione sale/tavoli appare solo nel
// primo caso; il secondo disattiva i moduli Sala e Prenotazioni del gestionale
// (localStorage condiviso — stesso formato di byupWriteModules in
// panoramica-sidebar.jsx, che qui non è caricato).
// Hero illustration sala vista dall'alto, accent color cycling per ogni sala,
// table dots con numero, counter animato, micro-copy posti.

function Step3SaleTavoli({rooms, setRooms, onNext, onBack}) {
  const totalTables = rooms.reduce((sum, r) => sum + r.tables, 0);

  // Modalità di servizio — nessuna preselezione: finché l'utente non sceglie,
  // la configurazione resta nascosta e Continua è disabilitato.
  // 'tavoli' → flusso sale/tavoli · 'asporto' → info box, moduli off.
  const [mode, setMode] = React.useState(null);
  // Asporto — acceso di default per chi ha sale e tavoli: quasi tutti fanno
  // anche un po' d'asporto, e chi non lo fa lo spegne qui in un tocco. Chi
  // sceglie "solo asporto" non ha niente da decidere: per lui è tutto.
  const [asporto, setAsporto] = React.useState(true);

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

  // Continua: scrive i flag moduli condivisi col gestionale prima di procedere.
  // Scrittura diretta su localStorage + evento 'byup-modules-change': stesso
  // formato/notifica di byupWriteModules (panoramica-sidebar.jsx), non caricato
  // in questa pagina.
  const handleContinue = () => {
    const flags = mode === 'asporto'
      ? {sala: false, prenotazioni: false, asporto: true}
      : {sala: true, prenotazioni: true, asporto};
    try {
      localStorage.setItem('byup_modules_enabled', JSON.stringify(flags));
      window.dispatchEvent(new Event('byup-modules-change'));
    } catch(e) {}
    onNext();
  };

  const canContinue =
    mode === 'asporto' ||
    (mode === 'tavoli' && rooms.length > 0 && totalTables > 0);

  return (
    <div style={{
      minHeight: '100%',
      background: ONB.BG_SOFT,
      padding: '32px 80px 28px',
      /* margin auto sull'inner: blocco centrato in verticale quando il
         contenuto è basso (scelta modalità), top-aligned quando cresce. */
      display: 'flex',
    }}>
      {/* Stessa griglia di step 1 e 2: contesto a sinistra, scelte a destra. */}
      <div style={{
        width: '100%', maxWidth: 1240, margin: 'auto',
        display: 'grid', gridTemplateColumns: STG('minmax(0, 1fr) 620px'),
        gap: 72, alignItems: 'start',
      }}>

        {/* ─── Colonna sinistra — contesto ────────────────────────────── */}
        {/* Il copy segue la modalità: prima è una domanda ("Come lavora il tuo
            locale?"), poi — scelto "Ho sale e tavoli" — diventa il titolo del
            flusso di configurazione. */}
        <div>
          <h1 style={{
            fontSize: 40, fontWeight: 600, lineHeight: 1.15,
            letterSpacing: '-0.025em', margin: '0 0 16px', color: ONB.TEXT,
          }}>
            {mode === 'tavoli' ? 'Crea sale, tavoli e QR Code.' : 'Come lavora il tuo locale?'}
          </h1>
          <p style={{
            fontSize: 18, fontWeight: 400, lineHeight: 1.5,
            color: ONB.MUTED, margin: '0 0 24px', maxWidth: 460,
          }}>
            {mode === 'tavoli'
              ? <>Aggiungi le sale del locale e quanti tavoli ospitano: ogni tavolo avrà 4 coperti, potrai modificarli in seguito.
                  Verrà generato un QR Code per ogni tavolo, stampali e applicali!</>
              : <>Scegli la modalità più adatta al tuo servizio: potrai cambiarla in qualsiasi momento dalle Impostazioni.</>}
          </p>

          {/* Planimetria astratta — decorativa, chiude la colonna di testo */}
          <SalaHeroIllustration/>

          <ProcessingBanner inline/>
        </div>

        {/* ─── Colonna destra — scelte e configurazione ───────────────── */}
        <div>

        {/* Scelta modalità — due radio card grandi affiancate */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          marginBottom: 16,
        }}>
          <ServiceModeCard
            selected={mode === 'tavoli'}
            icon="place-table"
            title="Ho sale e tavoli"
            desc="Ideale per i locali con servizio al tavolo: ristoranti, pizzerie, pub e cocktail bar."
            onSelect={() => setMode('tavoli')}
          />
          <ServiceModeCard
            selected={mode === 'asporto'}
            /* Era commerce-bag: la borsa con il manico ad arco su fondo grigio
               si leggeva come un lucchetto. Il carretto e' riconoscibile e
               riprende il "food truck" della descrizione. */
            icon="place-food-cart"
            title="Faccio solo asporto"
            desc="Ideale per chi lavora senza servizio al tavolo: pizzerie d'asporto, food truck e dark kitchen."
            onSelect={() => setMode('asporto')}
          />
        </div>

        {/* Asporto — subito sotto la scelta, perché è la stessa domanda vista
            da un altro lato: "e oltre ai tavoli, prepari anche da portar via?".
            Acceso di default; spegnendolo il gestionale non mostra le code del
            banco e i clienti non vedono l'opzione d'asporto. */}
        {mode === 'tavoli' && (
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px', marginBottom: 16, borderRadius: 10,
            background: asporto ? ONB.BRAND_TINT : '#fff',
            border: `1px solid ${asporto ? 'rgba(255, 90, 95, 0.28)' : 'rgba(15, 17, 21, 0.10)'}`,
            cursor: 'pointer',
            transition: 'background 150ms ease-out, border-color 150ms ease-out',
          }}>
            <input type="checkbox" checked={asporto} onChange={() => setAsporto(a => !a)}
              style={{margin: 0, marginTop: 3, accentColor: ONB.BRAND, width: 17, height: 17, flexShrink: 0}}/>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 16, fontWeight: 600, color: ONB.TEXT, lineHeight: 1.35}}>
                Faccio anche asporto
              </div>
              <div style={{fontSize: 14.5, color: ONB.MUTED, marginTop: 3, lineHeight: 1.45}}>
                Lasciandolo acceso i clienti lo vedono sull'app e possono ordinare da remoto e
                passare a ritirare al banco. <b style={{color: ONB.TEXT, fontWeight: 600}}>Se non fai
                asporto, toglilo</b>: nessuno potrà ordinare da portar via.
              </div>
            </div>
          </label>
        )}

        {/* Configurazione sale/tavoli — solo per "Ho sale e tavoli" */}
        {mode === 'tavoli' && <>

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
          fontSize: 16, fontWeight: 500, color: ONB.TEXT, fontFamily: 'inherit',
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

        </>}

        {/* Solo asporto — info box calmo al posto della configurazione */}
        {mode === 'asporto' && <AsportoInfoBox/>}

        {/* Footer — sticky come nello step 2: aggiungendo sale la colonna supera
            il canvas e "Continua" finirebbe sotto il bordo. */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', bottom: 0, zIndex: 5,
          marginTop: 20, paddingTop: 18, paddingBottom: 4,
          borderTop: '1px solid rgba(15, 17, 21, 0.08)',
          background: ONB.BG_SOFT,
        }}>
          <SecondaryCta onClick={onBack}>
            <OnbIcon.ArrowLeft size={14} color={ONB.TEXT}/>
            Indietro
          </SecondaryCta>
          <PrimaryCta onClick={handleContinue} disabled={!canContinue}>
            Continua
            <OnbIcon.ArrowRight size={14} color="#fff"/>
          </PrimaryCta>
        </div>
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
// ServiceModeCard — radio card grande per la scelta della modalità di servizio.
// Stesso idioma selected delle radio card del regime fiscale (step 2):
// BRAND_TINT + border brand al 30% quando selezionata, bianco + hairline
// altrimenti. Indicatore check circolare top-right (niente radio nativo:
// la card intera è il target).
// ─────────────────────────────────────────────────────────────────────────

function ServiceModeCard({selected, icon, title, desc, onSelect}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={selected ? 'aurora-soft-bg' : ''}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14,
        padding: '20px 20px 22px',
        ...(selected ? {} : {background: '#fff'}),
        border: `1px solid ${selected
          ? 'rgba(255, 90, 95, 0.30)'
          : hover ? 'rgba(15, 17, 21, 0.24)' : 'rgba(15, 17, 21, 0.08)'}`,
        borderRadius: 12,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        boxShadow: selected
          ? '0 4px 16px rgba(255, 90, 95, 0.08)'
          : '0 1px 0 rgba(15, 17, 21, 0.04)',
        transition: 'all 150ms ease-out',
      }}
    >
      {/* Indicatore selezione — check circolare, pattern dei selettori card */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: 18, right: 18,
        width: 22, height: 22, borderRadius: 999,
        background: selected ? ONB.BRAND : '#fff',
        border: selected ? 'none' : '1px solid rgba(15, 17, 21, 0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms ease-out',
      }}>
        {selected && <OnbIcon.Check size={11}/>}
      </span>

      {/* Icona — sistema Icon (panoramica-sf-icons, caricato in questa pagina) */}
      <span style={{
        width: 48, height: 48, borderRadius: 12,
        background: selected ? ONB.BRAND_SOFT : ONB.BG,
        color: selected ? ONB.BRAND_DARK : ONB.MUTED,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms ease-out',
      }}>
        <Icon name={icon} size={24}/>
      </span>

      <span style={{display: 'block'}}>
        <span style={{
          display: 'block', fontSize: 19, fontWeight: 600,
          color: ONB.TEXT, letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          {title}
        </span>
        <span style={{
          display: 'block', fontSize: 15, fontWeight: 400,
          color: ONB.MUTED, lineHeight: 1.45, marginTop: 4,
        }}>
          {desc}
        </span>
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AsportoInfoBox — sostituisce la configurazione sale quando l'utente sceglie
// "Faccio solo asporto". Tono calmo e rassicurante: spiega cosa sparisce dal
// gestionale e come riattivarlo (nessun allarme, è una scelta reversibile).
// ─────────────────────────────────────────────────────────────────────────

function AsportoInfoBox() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: '20px 22px',
      background: '#fff',
      border: '1px solid rgba(15, 17, 21, 0.08)',
      borderRadius: 12,
      boxShadow: '0 1px 0 rgba(15, 17, 21, 0.04)',
    }}>
      <span style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: ONB.BG, color: ONB.MUTED,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="commerce-bag" size={20}/>
      </span>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 16, fontWeight: 600, color: ONB.TEXT, lineHeight: 1.4}}>
          Nessuna sala da configurare
        </div>
        <div style={{
          fontSize: 15, fontWeight: 400, color: ONB.MUTED,
          lineHeight: 1.5, marginTop: 4,
        }}>
          Le sezioni Sala, Tavoli e Prenotazioni non compariranno nel gestionale:
          l'interfaccia resterà essenziale, pensata per il banco e l'asporto.
          Potrai riattivarle in qualsiasi momento da{' '}
          <strong style={{color: ONB.TEXT, fontWeight: 600}}>Impostazioni → Sala e tavoli</strong>.
        </div>
      </div>
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
        fontSize: 26, fontWeight: 600, color: ONB.TEXT,
        lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 500, color: ONB.MUTED,
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
            fontSize: 14, fontWeight: 500, color: ONB.MUTED,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Sala {index + 1}
          </span>
          {room.isDefault && (
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: ONB.BG, color: ONB.MUTED,
              fontSize: 12, fontWeight: 500, letterSpacing: '0.04em',
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
            fontSize: 17, fontWeight: 500, color: ONB.TEXT,
            fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 150ms ease-out',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = accent.fg}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(15, 17, 21, 0.10)'}
        />

      </div>

      {/* Tavoli della sala — riga a piena larghezza sotto le tre colonne.
          Stava dentro la colonna del nome: larga ~300px, ci spezzava "Ancora
          nessun tavolo" una parola per riga e faceva uscire il pulsante
          "Aggiungi tavolo" dal bordo della card. */}
      {/* Counter tavoli + micro-copy posti */}
      <div>
        <div style={{
          fontSize: 14, fontWeight: 500, color: ONB.MUTED,
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
        {/* Micro-copy: solo empty state. La capacità totale è già comunicata dal
            sub-head ("4 coperti per tavolo, modificabili dopo"); non serve ripeterla
            sotto ogni counter. */}
        {isEmpty && (
          <div style={{
            marginTop: 8,
            fontSize: 14, fontWeight: 400, color: ONB.MUTED,
            lineHeight: 1.4,
          }}>
            Aggiungi almeno un tavolo
          </div>
        )}
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

      {/* Tavoli / empty state — riga a piena larghezza sotto le tre colonne */}
      <div style={{gridColumn: '1 / -1'}}>
        {isEmpty ? (
          <EmptyTablesState accent={accent} onAdd={() => onUpdate('tables', 1)}/>
        ) : (
          <TableGrid count={room.tables} accent={accent}/>
        )}
      </div>
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
            fontSize: 18, fontWeight: 600, color: accent ? accent.fg : ONB.TEXT,
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
        fontSize: 20, fontWeight: 500, fontFamily: 'inherit',
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
          fontSize: 10, fontWeight: 600, color: accent.fg,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>
          {n}
        </div>
      ))}
      {overflow > 0 && (
        <span style={{
          gridColumn: 'span 4',
          fontSize: 13, color: ONB.MUTED, lineHeight: '14px',
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
          fontSize: 16, fontWeight: 600, color: ONB.TEXT, lineHeight: 1.4,
        }}>
          Ancora nessun tavolo
        </div>
        <div style={{
          fontSize: 15, fontWeight: 400, color: ONB.MUTED, lineHeight: 1.4,
          marginTop: 2,
        }}>
          Aggiungi i tavoli di questa sala.
        </div>
      </div>
      <button onClick={onAdd} style={{
        height: 36, padding: '0 14px',
        background: '#fff', color: accent.fg,
        border: `1px solid ${accent.fg}`,
        borderRadius: 8, fontFamily: 'inherit',
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
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
