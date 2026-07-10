// Grid + widget shell + drag fluido Apple-style.
// La card draggata segue il mouse con translate reale (no hop), diventa
// glass-ice (GLASS_DRAG) e leggermente scaled. Le altre card durante il drag
// scaleno a 0.99 + opacity 0.92 — comunicano "lo strato sottostante è cedevole".

function PnWidgetShell({ title, editMode, onRemove, dragging, otherDragging, wiggleDelay, children, size, onResize, fixedSize, theme, baseSize }) {
  const [hover, setHover] = React.useState(false);
  // Dimensioni: ogni card ha la sua misura base (dal catalogo) e UN solo
  // ingrandimento per direzione (raddoppio, cap a 4 colonne). Massimo due
  // passaggi totali: ↔ una volta + ↕ una volta. Ricliccare torna alla base.
  const w = (size && size.w) || 1;
  const h = (size && size.h) || 1;
  const baseW = (baseSize && baseSize.w) || 1;
  const baseH = (baseSize && baseSize.h) || 1;
  const bigW = Math.min(4, baseW * 2);
  const bigH = Math.min(4, baseH * 2);
  const isWide = w > baseW;
  const isTall = h > baseH;
  const canWide = bigW !== baseW;
  const canTall = bigH !== baseH;
  const toggleWide = () => onResize({ w: isWide ? baseW : bigW, h });
  const toggleTall = () => onResize({ w, h: isTall ? baseH : bigH });
  // 4 stati: dragging (la mossa, glass-ice), otherDragging (un'altra in moto, scaled),
  // editMode (wiggle iOS edit-mode), idle.
  const inEditWiggle = editMode && !dragging;
  // Theme surface tokens — solo "aurora" intercepted qui. "sunset"/dark passa
  // di solito via GlassDarkBox interno con margine negativo (es. Top piatti,
  // Cucina live), quindi non serve verniciare lo shell. Default = white W1.
  //
  // L2 aurora soft wash multi-color: pink + lavender + cream mesh su base
  // sfumata pink→lavender. Stesso DNA della variant L2 nella preview themes.
  const auroraSurface = theme === 'aurora' ? {
    background:
      'radial-gradient(circle at 20% 18%, rgba(255, 217, 231, 0.55) 0%, transparent 60%), ' +
      'radial-gradient(circle at 85% 25%, rgba(226, 217, 255, 0.50) 0%, transparent 60%), ' +
      'radial-gradient(circle at 60% 95%, rgba(255, 237, 216, 0.55) 0%, transparent 65%), ' +
      'linear-gradient(135deg, #FFF6F4 0%, #FCF8FF 100%)',
    border: `1px solid ${editMode && hover ? PN.PINK : 'rgba(190, 175, 220, 0.14)'}`,
    boxShadow: editMode && hover ? PN.CARD_SHADOW_HOVER : PN.CARD_SHADOW,
  } : null;

  const dragStyle = dragging
    ? {
        ...PN.GLASS_DRAG,
        borderRadius: 14,
        transform: 'scale(1.04) rotate(-0.5deg)',
      }
    : {
        ...(auroraSurface || {
          background: PN.WHITE,
          border: `1px solid ${editMode && hover ? PN.PINK : PN.BORDER_HAIR}`,
          boxShadow: editMode && hover ? PN.CARD_SHADOW_HOVER : PN.CARD_SHADOW,
        }),
        // Wiggle Apple iOS: rotation ±0.5deg con stagger via animation-delay
        // così le card non sono mai in fase identica.
        animation: inEditWiggle
          ? `wiggle-edit 0.42s ease-in-out infinite ${wiggleDelay}ms`
          : 'none',
        transformOrigin: 'center center',
        opacity: otherDragging ? 0.92 : 1,
      };
  return (
    <div
      // glass-lift-hover applicato SOLO quando NON in edit mode e NON è in
      // stato di drag: il lift è incompatibile con lo stato draggable (sarebbe
      // doppia traslazione + jitter) e col wiggle dell'edit mode (sarebbero
      // due animation in contemporanea).
      className={(!editMode && !dragging) ? 'glass-lift-hover' : ''}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        borderRadius: 14,
        padding: '18px 18px 16px',
        height: '100%',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        // Apple cubic-bezier "spring": entry rapido, settle morbido.
        transition: dragging
          ? 'transform 60ms ease-out'
          : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out',
        ...dragStyle,
      }}
    >
      {editMode && (
        <>
          <div style={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', gap: 4, zIndex: 2,
            opacity: hover ? 1 : 0.6,
            transition: 'opacity 0.15s',
          }}>
            {/* Resize buttons: nascosti per widget fixedSize (es. Azioni launcher).
                Un solo ingrandimento per direzione rispetto alla misura base:
                ↔ raddoppia la larghezza, ↕ raddoppia l'altezza; ricliccare torna
                alla base. Max due passaggi totali. */}
            {!fixedSize && (
              <>
                {canWide && <button
                  onClick={toggleWide}
                  title={isWide ? 'Riduci larghezza' : 'Allarga'}
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: isWide ? PN.PINK : PN.WHITE,
                    border: `1px solid ${isWide ? PN.PINK : PN.BORDER_LIGHT}`,
                    cursor: 'pointer',
                    display: 'grid', placeItems: 'center',
                    color: isWide ? PN.WHITE : PN.MUTED,
                    fontSize: 16, fontWeight: 700, lineHeight: 1,
                    transition: 'background 150ms ease, color 150ms ease',
                  }}>
                  ↔
                </button>}
                {canTall && <button
                  onClick={toggleTall}
                  title={isTall ? 'Riduci altezza' : 'Alza'}
                  style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: isTall ? PN.PINK : PN.WHITE,
                    border: `1px solid ${isTall ? PN.PINK : PN.BORDER_LIGHT}`,
                    cursor: 'pointer',
                    display: 'grid', placeItems: 'center',
                    color: isTall ? PN.WHITE : PN.MUTED,
                    fontSize: 16, fontWeight: 700, lineHeight: 1,
                    transition: 'background 150ms ease, color 150ms ease',
                  }}>
                  ↕
                </button>}
              </>
            )}
            <button
              onClick={onRemove}
              title="Rimuovi"
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: PN.WHITE,
                border: `1px solid ${PN.BORDER_LIGHT}`,
                cursor: 'pointer',
                display: 'grid', placeItems: 'center',
                color: PN.RED,
              }}>
              <Icon name="xmark" size={13}/>
            </button>
          </div>

          {/* Corner resize indicator — segnale visivo che la card è ridimensionabile.
              Tre puntini bianchi in basso a destra (pattern Mac classic per resize handle).
              Nascosto per widget fixedSize. */}
          {!fixedSize && (
            <div aria-hidden="true" style={{
              position: 'absolute',
              right: 6, bottom: 6,
              width: 14, height: 14,
              opacity: hover ? 0.7 : 0.30,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
              zIndex: 2,
              background:
                'radial-gradient(circle at 100% 100%, ' + PN.MUTED + ' 1.4px, transparent 2px) 0 0/4px 4px,' +
                'radial-gradient(circle at 100% 100%, ' + PN.MUTED + ' 1.4px, transparent 2px) 4px 0/4px 4px,' +
                'radial-gradient(circle at 100% 100%, ' + PN.MUTED + ' 1.4px, transparent 2px) 0 4px/4px 4px',
              backgroundRepeat: 'no-repeat',
            }}/>
          )}
        </>
      )}
      <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
        {children}
      </div>
    </div>
  );
}

function PnGrid({ widgets, editMode, onRemove, onReorder, onResize }) {
  const [dragId, setDragId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);
  // Offset reale del mouse rispetto al punto di partenza — la card draggata
  // segue il puntatore via transform translate, NON salta a metà della cella.
  const [dragOffset, setDragOffset] = React.useState({x: 0, y: 0});

  // Drag da qualsiasi punto della card, sempre attivo (anche fuori da Personalizza).
  // Soglia di 6px: sotto è un click e va ai controlli interni del widget;
  // gli elementi interattivi non avviano mai il drag.
  const handleDragStart = (id) => (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, select, textarea')) return;
    const startX = e.clientX, startY = e.clientY;
    let active = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!active) {
        if (Math.hypot(dx, dy) < 6) return;
        active = true;
        document.body.style.userSelect = 'none';
        setDragId(id);
      }
      setDragOffset({x: dx, y: dy});
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const card = el?.closest('[data-widget-id]');
      if (card) setOverId(card.getAttribute('data-widget-id'));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!active) return;
      document.body.style.userSelect = '';
      setDragId(curDrag => {
        setOverId(curOver => {
          if (curDrag && curOver && curDrag !== curOver) onReorder(curDrag, curOver);
          return null;
        });
        return null;
      });
      setDragOffset({x: 0, y: 0});
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      gridAutoRows: '142px',
      // Bento layout: dense permette al browser di riempire i gap retroattivamente
      // — es. quando un 1×2 viene dopo un 2×1, viene piazzato nel gap rimasto
      // invece di lasciare uno slot vuoto. Risultato: widget chiudono tutti
      // alla stessa altezza, niente buchi visibili.
      gridAutoFlow: 'dense',
    }}>
      {widgets.map((w, idx) => {
        const def = PN_WIDGET_CATALOG.find(c => c.id === w.id);
        if (!def) return null;
        const Comp = PnWidgets[def.component];
        const isDragging      = dragId === w.id;
        const isOtherDragging = !!dragId && !isDragging;
        // Stagger del wiggle: ogni card ha un delay diverso (0/40/80/120/160ms loop)
        // così non si vede mai un movimento sincronizzato innaturale.
        const wiggleDelay = (idx * 40) % 200;
        // Wrapper outer: gridPlacement + lift via transform translate quando draggato.
        // pointer-events: none sulla card draggata permette all'hit-test di trovare
        // le card SOTTO il puntatore (altrimenti elementFromPoint trova solo
        // la card mossa).
        return (
          <div key={w.id}
            data-widget-id={w.id}
            onMouseDown={handleDragStart(w.id)}
            style={{
              gridColumn: `span ${w.size.w}`,
              gridRow:    `span ${w.size.h}`,
              minHeight: 0,
              borderRadius: 14,
              position: 'relative',
              cursor: isDragging ? 'grabbing' : 'grab',
              zIndex: isDragging ? 50 : 1,
              transform: isDragging
                ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
                : 'none',
              transition: isDragging ? 'none' : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: isDragging ? 'none' : 'auto',
              // Drop indicator — la card target ha ring brand on hover during drag
              outline: overId === w.id && !isDragging
                ? `2px dashed ${PN.PINK}`
                : 'none',
              outlineOffset: 4,
            }}>
            <PnWidgetShell
              title={def.name}
              editMode={editMode}
              dragging={isDragging}
              otherDragging={isOtherDragging}
              wiggleDelay={wiggleDelay}
              onRemove={() => onRemove(w.id)}
              size={w.size}
              baseSize={def.defaultSize}
              fixedSize={def.fixedSize}
              theme={def.theme}
              onResize={(newSize) => onResize && onResize(w.id, newSize)}>
              <Comp size={w.size}/>
            </PnWidgetShell>
          </div>
        );
      })}
    </div>
  );
}

// CSS keyframe wiggle iOS edit-mode — rotation simmetrica ±0.5deg.
// Iniettato come <style> globale al mount di PnGrid (via useEffect).
if (typeof document !== 'undefined' && !document.getElementById('pn-grid-wiggle-style')) {
  const s = document.createElement('style');
  s.id = 'pn-grid-wiggle-style';
  s.innerHTML = `
    @keyframes wiggle-edit {
      0%, 100% { transform: rotate(-0.5deg); }
      50%      { transform: rotate(0.5deg); }
    }
    /* Scrollbar overlay-style per la lista prenotazioni — visibile solo on hover */
    .prenot-list::-webkit-scrollbar { width: 0; }
    .prenot-list:hover::-webkit-scrollbar { width: 6px; }
    .prenot-list:hover::-webkit-scrollbar-thumb { background: rgba(15, 17, 21, 0.18); border-radius: 999px; }
  `;
  document.head.appendChild(s);
}

window.PnGrid = PnGrid;
window.PnWidgetShell = PnWidgetShell;
