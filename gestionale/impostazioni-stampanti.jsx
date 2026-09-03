// Impostazioni → Stampanti (P-101 · SFA §7.1-7.3)
//
// La scheda coi nomi del modello: le stampanti della sede (devices di tipo
// printer, con la modalità), la stampante di cortesia della sede
// (venue_settings.courtesy_printer_device_id), la stampa automatica della
// cortesia per gli ordini delle piattaforme (auto_print_courtesy, spenta e
// spiegata: le piattaforme sono predisposte, non attive) e la prova di
// stampa. Il registro e i layout stanno in stampa.jsx, che carica anche
// l'App Staff: il ponte bluetooth si accende di là e qui si vede.

function ImpStampanti() {
  const [reg, setReg] = React.useState(() => window.byupReadStampanti());
  const [toast, setToast] = React.useState(null);
  const [nuova, setNuova] = React.useState(null); // null | { name, model, print_mode, ip }
  React.useEffect(() => {
    const agg = () => setReg(window.byupReadStampanti());
    window.addEventListener('byup-stampanti-change', agg);
    window.addEventListener('storage', agg);
    return () => { window.removeEventListener('byup-stampanti-change', agg); window.removeEventListener('storage', agg); };
  }, []);
  const salva = (next) => { window.byupWriteStampanti(next); setReg(window.byupReadStampanti()); };
  const avvisa = (t) => { setToast(t); setTimeout(() => setToast(null), 2600); };

  const prova = (d) => {
    const e = window.byupProvaStampa(d);
    avvisa(e.esito === 'stampata' ? `Prova inviata alla stampa del browser · ${d.name}`
      : e.esito === 'anteprima' ? `Anteprima aperta: l'invio ${window.PN_PRINT_MODES[d.print_mode].breve} nel prototipo non parte`
      : 'Il browser ha bloccato la finestra di stampa');
    setReg(window.byupReadStampanti());
  };
  const aggiungi = () => {
    if (!nuova || !nuova.name.trim()) return;
    const id = 'prn-' + Date.now().toString(36);
    const d = { id, device_type: 'printer', name: nuova.name.trim(), model: nuova.model.trim() || '—', print_mode: nuova.print_mode,
      ip: nuova.print_mode === 'wifi' ? (nuova.ip || '192.168.1.120') : null, protocol: nuova.print_mode === 'wifi' ? 'epos' : null,
      bridge_device_id: nuova.print_mode === 'bluetooth' ? 'bp-01' : null, bridge_label: nuova.print_mode === 'bluetooth' ? 'iPhone 14 Pro · Marco Silvestri' : null,
      bridge_online: nuova.print_mode === 'bluetooth' ? false : undefined, online: nuova.print_mode !== 'bluetooth', categories: [], last_test_at: null };
    salva({ ...reg, devices: [...reg.devices, d] }); setNuova(null); avvisa(`«${d.name}» registrata`);
  };
  const rimuovi = (d) => salva({ ...reg, devices: reg.devices.filter(x => x.id !== d.id),
    venue_settings: { ...reg.venue_settings, courtesy_printer_device_id: reg.venue_settings.courtesy_printer_device_id === d.id ? 'prn-browser' : reg.venue_settings.courtesy_printer_device_id } });

  const Pill = ({ children, tono }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: tono === 'ok' ? PN.GREEN_SOFT : tono === 'attesa' ? PN.AMBER_SOFT : '#F4F5F7', color: tono === 'ok' ? '#065F46' : tono === 'attesa' ? '#8A5A00' : PN.MUTED }}>{children}</span>
  );
  const stato = (d) => d.print_mode === 'bluetooth' ? (d.bridge_online ? ['Ponte attivo', 'ok'] : ['Ponte spento', 'attesa'])
    : d.print_mode === 'wifi' ? (d.online ? ['In rete', 'ok'] : ['Non raggiungibile', 'attesa']) : ['Sempre disponibile', 'ok'];
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div>
      <ImpCard title="Stampanti della sede" sub="Comande e documenti di cortesia: la stampa passa dal browser o dalla superficie collegata, mai da driver o SDK, e la stampante non è mai esposta al cloud."
        action={<ImpButton onClick={() => setNuova({ name: '', model: '', print_mode: 'wifi', ip: '' })}>Aggiungi stampante</ImpButton>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reg.devices.map(d => {
            const [lab, tono] = stato(d);
            return (
              <div key={d.id} data-stampante={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: PN.TEXT }}>{d.name} <span style={{ fontWeight: 500, color: PN.MUTED }}>· {d.model}</span></div>
                  <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 2 }}>
                    {window.PN_PRINT_MODES[d.print_mode].label}
                    {d.print_mode === 'wifi' && d.ip ? ` · ${d.ip} · ${d.protocol === 'cloudprnt' ? 'CloudPRNT' : 'ePOS'}` : ''}
                    {d.print_mode === 'bluetooth' && d.bridge_label ? ` · ponte: ${d.bridge_label}` : ''}
                    {d.categories && d.categories.length ? ` · comande: ${d.categories.join(', ')}` : d.fisso ? '' : ' · nessuna categoria di comanda'}
                  </div>
                  {d.last_test_at && <div style={{ fontSize: 12, color: PN.MUTED, marginTop: 2 }}>Ultima prova {fmt(d.last_test_at)}</div>}
                </div>
                <Pill tono={tono}>{lab}</Pill>
                {reg.venue_settings.courtesy_printer_device_id === d.id && <Pill tono="ok">Cortesia della sede</Pill>}
                <ImpButton variant="secondary" onClick={() => prova(d)}>Prova di stampa</ImpButton>
                {!d.fisso && <button onClick={() => rimuovi(d)} className="pn-btn-feedback" title="Scollega" style={{ background: 'transparent', border: 'none', color: PN.MUTED, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>Scollega</button>}
              </div>
            );
          })}
        </div>
        {nuova && (
          <div data-nuova-stampante style={{ marginTop: 12, padding: 14, borderRadius: 11, border: `1px dashed ${PN.BORDER}`, display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) auto', gap: 10, alignItems: 'end' }}>
            <label style={{ fontSize: 12.5, color: PN.MUTED, fontWeight: 600 }}>Nome<input value={nuova.name} onChange={e => setNuova({ ...nuova, name: e.target.value })} placeholder="es. Pizzeria" style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}/></label>
            <label style={{ fontSize: 12.5, color: PN.MUTED, fontWeight: 600 }}>Modello<input value={nuova.model} onChange={e => setNuova({ ...nuova, model: e.target.value })} placeholder="es. Epson TM-m30II" style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}/></label>
            <label style={{ fontSize: 12.5, color: PN.MUTED, fontWeight: 600 }}>Modalità<select value={nuova.print_mode} onChange={e => setNuova({ ...nuova, print_mode: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
              {Object.entries(window.PN_PRINT_MODES).filter(([k]) => k !== 'browser').map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <ImpButton onClick={aggiungi}>Registra</ImpButton>
              <ImpButton variant="secondary" onClick={() => setNuova(null)}>Annulla</ImpButton>
            </div>
            <div style={{ gridColumn: '1 / -1', fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5 }}>{window.PN_PRINT_MODES[nuova.print_mode].nota} Le categorie di comanda si assegnano in Personale, al dispositivo: una categoria non può stare su due stampanti.</div>
          </div>
        )}
      </ImpCard>

      <ImpCard title="Documento di cortesia" sub="Il foglio che il cliente porta via dopo il pagamento. Non è lo scontrino: il documento commerciale lo emette il canale fiscale.">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 7 }}>Stampante di cortesia della sede</div>
            <select data-cortesia value={reg.venue_settings.courtesy_printer_device_id || 'prn-browser'}
              onChange={e => salva({ ...reg, venue_settings: { ...reg.venue_settings, courtesy_printer_device_id: e.target.value } })}
              style={{ width: '100%', padding: '9px 11px', border: `1px solid ${PN.BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
              {reg.devices.map(d => <option key={d.id} value={d.id}>{d.name} · {d.model}</option>)}
            </select>
            <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 8, lineHeight: 1.5 }}>La usa la cassa dopo l'incasso («Stampa documento di cortesia») e, se accesa, la stampa automatica per gli ordini delle piattaforme. È venue_settings.courtesy_printer_device_id.</div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 7 }}>Ordini delle piattaforme</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6, cursor: 'not-allowed' }}>
              <input type="checkbox" checked={!!reg.venue_settings.auto_print_courtesy} disabled readOnly/>
              <span style={{ fontSize: 14, color: PN.TEXT }}>Stampa automatica del documento di cortesia</span>
            </label>
            <div style={{ fontSize: 12.5, color: PN.MUTED, marginTop: 8, lineHeight: 1.5 }}>Spenta e non accendibile: le piattaforme (Just Eat, Glovo, Deliveroo) sono predisposte, non attive — entrano solo con gli accordi. È venue_delivery_integrations.auto_print_courtesy, una per piattaforma.</div>
          </div>
        </div>
      </ImpCard>

      <ImpCard title="Come stampa Byup" sub="Tre vie, una base garantita.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          {Object.entries(window.PN_PRINT_MODES).map(([k, m]) => (
            <div key={k} style={{ padding: '12px 14px', borderRadius: 11, border: `1px solid ${PN.BORDER_SOFT}` }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: PN.TEXT }}>{m.label}</div>
              <div style={{ fontSize: 13, color: PN.MUTED, marginTop: 4, lineHeight: 1.5 }}>{m.nota}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '10px 13px', borderRadius: 9, background: '#FAFBFC', border: `1px solid ${PN.BORDER_SOFT}`, fontSize: 12.5, color: PN.MUTED, lineHeight: 1.5 }}>
          Nel prototipo la stampa dal browser è vera: la prova di stampa apre il layout e lo manda in stampa. In Wi-Fi e Bluetooth la prova apre la stessa anteprima e dice che l'invio non parte: senza backend non ci sono ePOS, CloudPRNT, ponte, instradamento per categoria, coda né fallback. La matrice di compatibilità reale si prova sul campo e si riporta nella SFA.
        </div>
      </ImpCard>

      {toast && (
        <div style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: PN.TEXT, color: '#fff', padding: '10px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, zIndex: 90, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>{toast}</div>
      )}
    </div>
  );
}
window.ImpStampanti = ImpStampanti;
