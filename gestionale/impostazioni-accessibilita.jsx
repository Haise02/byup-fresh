// Impostazioni → Accessibilità
//
// Qui si sceglie quanto è grande il gestionale e se l'interfaccia si muove.
// Due cose sole, perché sono le due che cambiano davvero la vita a chi fatica
// a leggere da vicino o a chi il movimento dà fastidio.
//
// Le etichette sono in italiano e SENZA percentuali: «175%» non dice niente a
// chi non sa cosa sia uno zoom, e il gestore che ne ha bisogno è esattamente
// quello che non lo sa. Al posto del numero c'è un'ANTEPRIMA VIVA — un pezzo
// vero di gestionale, una card di tavolo e un importo — disegnata alla misura
// scelta: si guarda e si capisce, senza dover immaginare.

function ImpAccessibilita() {
  const { scaleId, scale } = useA11y();

  // Il movimento: si parte da quello che dice il sistema operativo
  // (EN 301 549 §11.7) e da lì in poi comanda questa scelta, che resta scritta.
  const [moto, setMoto] = React.useState(() => (window.byupGetMoto ? window.byupGetMoto() : 'auto'));
  const sistemaRiduce = window.byupSistemaRiduce ? window.byupSistemaRiduce() : false;
  const ridotto = moto === 'si' || (moto === 'auto' && sistemaRiduce);
  const cambiaMoto = (attivo) => {
    const v = attivo ? 'si' : 'no';
    setMoto(v);
    if (window.byupSetMoto) window.byupSetMoto(v);
  };

  const mac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform || '');
  const tastoMod = mac ? '⌘' : 'Ctrl';

  return (
    <div style={{maxWidth: 820}}>
      <div style={{marginBottom: 22}}>
        <h1 style={{margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: -0.5, color: PN.TEXT}}>
          Accessibilità
        </h1>
        <p style={{margin: '6px 0 0', fontSize: 15, color: PN.MUTED, lineHeight: 1.5}}>
          Quanto è grande il gestionale su questo schermo, e se l'interfaccia si muove.
        </p>
      </div>

      <ImpCard
        title="Dimensione dell'interfaccia"
        sub="Vale per questo dispositivo. Il tablet in cucina e il computer in ufficio possono avere misure diverse.">
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {BYUP_SCALE_INFO.map(l => {
            const on = scaleId === l.id;
            return (
              <button key={l.id} type="button"
                onClick={() => window.byupSetScale && window.byupSetScale(l.id)}
                aria-pressed={on}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px', borderRadius: 14, textAlign: 'left',
                  border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                  background: on ? PN.PINK_BG_SOFT : PN.WHITE,
                  cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                  minHeight: 44,
                }}>
                {/* Il pallino della scelta: tondo pieno quando è quello attivo. */}
                <span aria-hidden="true" style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: `2px solid ${on ? PN.PINK : PN.BORDER}`,
                  background: PN.WHITE, display: 'grid', placeItems: 'center',
                }}>
                  {on && <span style={{width: 11, height: 11, borderRadius: '50%', background: PN.PINK}}/>}
                </span>
                <span style={{flex: 1, minWidth: 0}}>
                  <span style={{
                    display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap',
                  }}>
                    <span style={{fontSize: 17, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.2}}>{l.nome}</span>
                    {/* La «A» cresce con il livello: è il numero, detto senza numero. */}
                    <span aria-hidden="true" style={{
                      fontWeight: 800, color: on ? PN.WINE : PN.MUTED,
                      fontSize: 13 + BYUP_SCALE_INFO.indexOf(l) * 5, lineHeight: 1,
                    }}>A</span>
                  </span>
                  <span style={{
                    display: 'block', fontSize: 14.5, color: PN.MUTED, lineHeight: 1.5, marginTop: 3,
                  }}>{l.descrizione}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 16, fontSize: 14, color: PN.MUTED, lineHeight: 1.5,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span>Da tastiera, in qualunque schermata:</span>
          <Scorciatoia testo={tastoMod + ' + Alt + +'}/>
          <span>per ingrandire,</span>
          <Scorciatoia testo={tastoMod + ' + Alt + −'}/>
          <span>per rimpicciolire.</span>
        </div>
      </ImpCard>

      <ImpAnteprimaScala scale={scale} scaleId={scaleId}/>

      <ImpCard
        title="Movimento"
        sub="Alcune parti del gestionale si animano quando qualcosa cambia — una card che entra, un numero che pulsa.">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Riduci le animazioni</div>
            <div style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.5, marginTop: 3}}>
              {sistemaRiduce
                ? 'Il tuo computer chiede già di ridurre il movimento: il gestionale lo segue, e da qui puoi decidere diversamente.'
                : 'Le transizioni diventano immediate e niente si muove da solo. Colori e stati restano come sono.'}
            </div>
          </div>
          <ImpToggle checked={ridotto} onChange={cambiaMoto} etichetta="Riduci le animazioni"/>
        </div>
      </ImpCard>
    </div>
  );
}

function Scorciatoia({ testo }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: 7,
      border: `1px solid ${PN.BORDER}`, background: PN.WHITE,
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: PN.TEXT,
      boxShadow: '0 1px 0 rgba(15,17,21,0.06)',
    }}>{testo}</kbd>
  );
}

// ─── L'anteprima dal vivo ───────────────────────────────────────────────────
// Non è il disegno di un'interfaccia: è un pezzo VERO di gestionale — l'importo
// da incassare e il suo pulsante — ripetuto ai tre livelli, ciascuno alla
// propria misura. Il confronto è il punto: la scelta si applica subito, quindi
// mostrare «come sarà» quello che si è già scelto non direbbe niente; mettere
// i tre accanto dice quanto si guadagna passando da uno all'altro, e lo dice a
// chi non sa cosa voglia dire «zoom del 175%».
//
// Ogni campione porta `zoom: fattore / scalaCorrente`: così la misura a schermo
// è quella VERA di quel livello, qualunque sia la scala con cui si sta
// guardando questa pagina. Senza il rapporto, la pagina già scalata avrebbe
// moltiplicato due volte.
function ImpAnteprimaScala({ scale, scaleId }) {
  return (
    <ImpCard
      title="Le tre misure a confronto"
      sub="Lo stesso pezzo di gestionale, disegnato ai tre livelli. Quello con il bordo è il tuo.">
      <div className="pn-scroll" data-anteprima-scala style={{
        maxHeight: 300, overflow: 'auto',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {BYUP_SCALE_INFO.map(l => {
          const on = l.id === scaleId;
          return (
            <div key={l.id} style={{
              borderRadius: 14, padding: 12,
              border: `1.5px solid ${on ? PN.PINK : PN.BORDER_SOFT}`,
              background: on ? PN.PINK_BG_SOFT : PN.BG,
            }}>
              <div style={{
                fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6,
                textTransform: 'uppercase', color: on ? PN.WINE : PN.MUTED,
                marginBottom: 8,
              }}>{l.nome}{on ? ' · in uso' : ''}</div>
              <div data-campione={l.id} style={{ zoom: l.fattore / (scale || 1) }}>
                <div style={{
                  background: PN.WHITE, borderRadius: 12, padding: '12px 14px',
                  border: `1px solid ${PN.BORDER_HAIR}`, boxShadow: PN.CARD_SHADOW,
                  display: 'flex', alignItems: 'center', gap: 12, maxWidth: 300,
                }}>
                  <span style={{flex: 1, minWidth: 0}}>
                    <span style={{
                      display: 'block', fontSize: 11, fontWeight: 800, color: PN.MUTED,
                      letterSpacing: 0.6, textTransform: 'uppercase',
                    }}>Da incassare</span>
                    <span style={{
                      display: 'block', fontSize: 24, fontWeight: 800, color: PN.TEXT,
                      letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums', marginTop: 2,
                    }}>€ 133,00</span>
                  </span>
                  <span style={{
                    padding: '9px 15px', borderRadius: 10, flexShrink: 0,
                    background: PN.BTN_DARK, color: PN.WHITE,
                    fontSize: 14.5, fontWeight: 700,
                    boxShadow: PN.INSET_HIGHLIGHT_DARK,
                  }}>Salda</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ImpCard>
  );
}

window.ImpAccessibilita = ImpAccessibilita;
