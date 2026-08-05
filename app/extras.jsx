/* global React, ReactDOM */
// extras.jsx — Profile, Venue, Booking sheet, fancy food icons
const { useState, useEffect, useRef } = React;

// ─── Tokens (mirror app.jsx) ────────────────────────────────
// Tema letto al load (pagina = file separato → dark coerente cross-page)
const __BYUP_DK_X = (() => {
  try {
    const m = localStorage.getItem('byup.themeMode') || 'light';
    if (m === 'dark') return true;
    if (m === 'auto') return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return false;
  } catch { return false; }
})();
const PINK_X = '#E32459';
const TEXT_X = __BYUP_DK_X ? '#f6ece9' : '#1c0f15';
const MUTED_X = __BYUP_DK_X ? 'rgba(246,236,233,.58)' : '#6d5a61';
const BG_X = __BYUP_DK_X ? '#161514' : '#FBF4F1';
const BORDER_X = __BYUP_DK_X ? 'rgba(246,236,233,.13)' : '#eddfda';
const SURF_X = __BYUP_DK_X ? '#211f22' : '#fff';        // card
const TINT_X = __BYUP_DK_X ? '#2b272c' : '#F8F5F6';     // superficie tenue
const MUTESURF_X = __BYUP_DK_X ? '#39333b' : '#e7e1d8'; // muta
const CORALSURF_X = __BYUP_DK_X ? 'rgba(239,99,137,.16)' : '#FCE9EE'; // chip coral

// ─── Profile screen ─────────────────────────────────────────
// I 14 allergeni del Reg. UE 1169/2011, tutti presenti.
const PROFILE_ALLERGENS = [
  { id: 'glutine',     label: 'Glutine',         hint: 'Pane, pasta, dolci',    emoji: '🌾' },
  { id: 'crostacei',   label: 'Crostacei',       hint: 'Gamberi, scampi, granchio', emoji: '🦐' },
  { id: 'uova',        label: 'Uova',            hint: 'Frittate, dolci, salse', emoji: '🥚' },
  { id: 'pesce',       label: 'Pesce',           hint: 'Acciughe, salse di pesce', emoji: '🐟' },
  { id: 'arachidi',    label: 'Arachidi',        hint: 'Burro di arachidi, snack', emoji: '🥜' },
  { id: 'soia',        label: 'Soia',            hint: 'Tofu, tempeh, salsa di soia', emoji: '🫘' },
  { id: 'lattosio',    label: 'Latte e lattosio', hint: 'Latte, formaggi, burro', emoji: '🥛' },
  { id: 'noci',        label: 'Frutta a guscio', hint: 'Noci, nocciole, mandorle', emoji: '🌰' },
  { id: 'sedano',      label: 'Sedano',          hint: 'Brodi, soffritti', emoji: '🥬' },
  { id: 'senape',      label: 'Senape',          hint: 'Salse, condimenti, marinature', emoji: '🌭' },
  { id: 'sesamo',      label: 'Sesamo',          hint: 'Pane, grissini, tahina', emoji: '🥯' },
  { id: 'solfiti',     label: 'Anidride solforosa e solfiti', hint: 'Vino, frutta secca, sottaceti', emoji: '🍷' },
  { id: 'lupini',      label: 'Lupini',          hint: 'Snack, farine vegetali', emoji: '🌼' },
  { id: 'molluschi',   label: 'Molluschi',       hint: 'Cozze, vongole, calamari', emoji: '🦪' },
];
const PROFILE_DIETS = [
  { id: 'vegetariano',   label: 'Vegetariano',   emoji: '🥗' },
  { id: 'vegano',        label: 'Vegano',        emoji: '🌱' },
  { id: 'senzaglutine',  label: 'Senza glutine', emoji: '🌾' },
  { id: 'halal',         label: 'Halal',         emoji: '🌙' },
  { id: 'kosher',        label: 'Kosher',        emoji: 'Ⓚ' },
  { id: 'pescetariano',  label: 'Pescetariano',  emoji: '🐟' },
  { id: 'astemio',       label: 'Astemio',       emoji: '🧃' },
  { id: 'proteico',      label: 'Proteico',      emoji: '💪' },
];
const PROFILE_ORDERS = [
  { id: 'ORD-1042', venue: 'Trattoria Lucia',    address: 'Via della Lungaretta 10, Trastevere', cuisine: 'Cucina romana',   date: '12 mar', time: '20:45', items: [{n:'Cacio e pepe',p:16}, {n:'Saltimbocca alla romana',p:18}, {n:'Tiramisù',p:7}], total: 56.50, status: 'completato',
    photo: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&q=70&auto=format&fit=crop' },
  { id: 'ORD-1037', venue: 'Da Michele Pizzeria', address: 'Via Sforza Cesarini 6, Centro Storico', cuisine: 'Pizzeria',       date: '08 mar', time: '21:10', items: [{n:'Margherita',p:9}, {n:'Diavola',p:10}, {n:'Birra Moretti',p:5}], total: 28.00, status: 'completato',
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70&auto=format&fit=crop' },
  { id: 'ORD-1031', venue: 'Lounge 22',          address: 'Via dei Banchi Vecchi 22, Centro Storico', cuisine: 'Cocktail bar',    date: '01 mar', time: '19:30', items: [{n:'Negroni',p:12}, {n:'Spritz',p:10}, {n:'Tagliere misto',p:14}], total: 42.00, status: 'completato',
    photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=70&auto=format&fit=crop' },
  { id: 'ORD-1028', venue: 'Al Settembrini',     address: 'Via Luigi Settembrini 25, Prati', cuisine: 'Ristorante',      date: '22 feb', time: '20:00', items: [{n:'Tartare di manzo',p:18}, {n:'Risotto al tartufo',p:24}, {n:'Vino della casa',p:12}], total: 74.00, status: 'completato',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70&auto=format&fit=crop' },
  { id: 'ORD-1020', venue: 'Hops & Co',          address: 'Via della Croce 15, Spagna', cuisine: 'Pub',             date: '14 feb', time: '22:15', items: [{n:'Burger del giorno',p:14}, {n:'Patatine',p:5}, {n:'IPA artigianale',p:7}], total: 34.00, status: 'completato',
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=70&auto=format&fit=crop' },
];

function ProfileToggle({ value, onChange }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onChange(!value); }} style={{
      width: 44, height: 26, borderRadius: 999,
      background: value ? PINK_X : '#d8d8d8',
      position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
      flex: '0 0 auto',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999, background: SURF_X,
        position: 'absolute', top: 2, left: value ? 20 : 2,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}/>
    </div>
  );
}

function AllergensView({ onBack, prefs, setPrefs }) {
  // ─── Consensi (registro A3 e A18, art. 9.2.a GDPR) ────────────────────
  // Just-in-time, come fanno le app comparabili: la sezione si SFOGLIA
  // liberamente (guardare la lista non conferisce nessun dato), e il
  // consenso A3 compare al PRIMO toggle — il momento in cui il dato nasce
  // davvero. A18 (offerte sulle preferenze) è la spunta autonoma sotto:
  // mai pre-attivata, mai registrata se non scelta. Il centro di controllo
  // resta nel pannello «I miei dati».
  const [consensoOk, setConsensoOk] = useState(() => { const st = ByupConsensi.stato('A3'); return !!(st && st.ok); });
  const [pending, setPending] = useState(null); // {group, id} in attesa del consenso
  const [chkA3, setChkA3] = useState(false);
  const [chkA18, setChkA18] = useState(false);

  const applica = (group, id) => setPrefs(p => ({
    ...p,
    [group]: { ...(p[group] || {}), [id]: !(p[group]?.[id]) },
  }));
  const toggle = (group, id) => {
    if (!consensoOk) { setPending({ group, id }); return; }
    applica(group, id);
  };
  const count = (group) => Object.values(prefs[group] || {}).filter(Boolean).length;

  const confermaConsensi = () => {
    if (!chkA3) return;
    ByupConsensi.set('A3', true);
    if (chkA18) ByupConsensi.set('A18', true);
    setConsensoOk(true);
    if (pending) applica(pending.group, pending.id);
    setPending(null);
  };
  const annullaConsensi = () => { setPending(null); setChkA3(false); setChkA18(false); };

  const CONSENSO_A3 = 'Acconsento al trattamento dei miei allergeni e delle mie preferenze alimentari, che possono rivelare dati su salute o convinzioni religiose, per filtrare i menu e personalizzare l\'esperienza. Posso modificarli o revocare quando voglio.';
  const CONSENSO_A18 = 'Voglio ricevere offerte e promozioni costruite sulle mie preferenze alimentari e i miei allergeni (es. proposte senza glutine). Le notifiche avranno testo generico: il dettaglio lo vedo in app.';

  const SectionHeader = ({ title, badge, description, icon, color, bg }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT_X }}>{title}</div>
        {badge > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: PINK_X, background: CORALSURF_X, padding: '3px 9px', borderRadius: 999 }}>
            {badge} {badge === 1 ? 'attivo' : 'attivi'}
          </div>
        )}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', background: __BYUP_DK_X ? TINT_X : bg, borderRadius: 10,
        borderLeft: `3px solid ${color}`,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12.5, color: MUTED_X, lineHeight: 1.45 }}>{description}</span>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'profileSlideIn 0.28s cubic-bezier(.2,.8,.2,1)' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Preferenze alimentari</div>
      <div style={{ fontSize: 13, color: MUTED_X, marginBottom: 28, lineHeight: 1.5 }}>
        Personalizza la tua esperienza nei menù dei locali.
      </div>

      {/* Diete */}
      <SectionHeader
        title="Le mie diete"
        badge={count('diets')}
        icon="✨"
        color="#30D158"
        bg="#F0FFF4"
        description="I piatti compatibili con la tua dieta appariranno in cima al menù."
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {PROFILE_DIETS.map(d => {
          const on = !!prefs.diets?.[d.id];
          return (
            <button key={d.id} onClick={() => toggle('diets', d.id)} style={{
              padding: '9px 16px 9px 12px', borderRadius: 999,
              border: `1.5px solid ${on ? PINK_X : '#E0DADC'}`,
              background: on ? CORALSURF_X : TINT_X,
              color: on ? PINK_X : TEXT_X,
              fontSize: 13.5, fontWeight: on ? 700 : 400,
              fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 17 }}>{d.emoji}</span>
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Allergie */}
      <SectionHeader
        title="Allergie e intolleranze"
        badge={count('allergens')}
        icon="🚫"
        color="#FF6B6B"
        bg="#FFF5F5"
        description="I piatti che contengono questi ingredienti verranno nascosti dal menù."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: TINT_X, borderRadius: 14, overflow: 'hidden' }}>
        {PROFILE_ALLERGENS.map((a, i) => {
          const on = !!prefs.allergens?.[a.id];
          return (
            <div key={a.id} onClick={() => toggle('allergens', a.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 14px',
              background: on ? '#FFF5F5' : SURF_X,
              cursor: 'pointer',
              transition: 'background 0.18s',
              borderBottom: i < PROFILE_ALLERGENS.length - 1 ? `1px solid #F0EAEC` : 'none',
            }}>
              <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{a.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: on ? '#D93025' : TEXT_X, transition: 'color 0.18s' }}>{a.label}</div>
                <div style={{ fontSize: 12, color: MUTED_X, marginTop: 1 }}>{a.hint}</div>
              </div>
              <ProfileToggle value={on} onChange={() => toggle('allergens', a.id)}/>
            </div>
          );
        })}
      </div>

      {/* Nota discreta: dove si gestisce tutto. */}
      <div style={{ fontSize: 11.5, color: MUTED_X, marginTop: 20, lineHeight: 1.5 }}>
        Gestisci consensi e revoca da Profilo → I miei dati.
      </div>

      {/* ─── Sheet just-in-time: compare al primo toggle, il momento in cui
          il dato nasce. Conferma → applica anche la scelta in sospeso;
          annulla → non si salva niente. */}
      {pending && (
        <div onClick={(e) => { if (e.target === e.currentTarget) annullaConsensi(); }} style={{
          position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,8,12,.5)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fade .2s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: 520, background: SURF_X, borderRadius: '24px 24px 0 0',
            padding: '12px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
            animation: 'slideUp .28s cubic-bezier(.2,.9,.3,1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 38, height: 4, borderRadius: 999, background: BORDER_X }}/>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: TEXT_X, marginBottom: 10 }}>Prima di salvare</div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={chkA3} onChange={e => setChkA3(e.target.checked)}
                style={{ accentColor: PINK_X, width: 17, height: 17, marginTop: 2, flexShrink: 0 }}/>
              <span style={{ fontSize: 12.5, color: TEXT_X, lineHeight: 1.5 }}>{CONSENSO_A3}</span>
            </label>
            <div style={{ height: 1, background: __BYUP_DK_X ? 'rgba(255,255,255,0.08)' : '#F0EAEC', margin: '11px 0' }}/>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={chkA18} onChange={e => setChkA18(e.target.checked)}
                style={{ accentColor: PINK_X, width: 17, height: 17, marginTop: 2, flexShrink: 0 }}/>
              <span style={{ fontSize: 12.5, color: MUTED_X, lineHeight: 1.5 }}>
                {CONSENSO_A18} <span style={{ color: '#C9C2C5' }}>(Facoltativa)</span>
              </span>
            </label>

            <button onClick={confermaConsensi} disabled={!chkA3} style={{
              width: '100%', marginTop: 14, padding: '14px 16px', borderRadius: 999,
              background: chkA3 ? PINK_X : TINT_X, color: chkA3 ? '#fff' : MUTED_X,
              border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: chkA3 ? 'pointer' : 'not-allowed', transition: 'background .18s, color .18s',
            }}>Conferma e salva</button>
            <button onClick={annullaConsensi} style={{
              width: '100%', padding: '11px 16px', marginTop: 4,
              background: 'transparent', color: MUTED_X, border: 'none',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            }}>Non ora</button>
          </div>
        </div>
      )}

    </div>
  );
}

function OrdersView({ onBack, initialOpenId }) {
  // initialOpenId: id ordine da aprire all'arrivo (deep-link da "Vedi scontrino").
  // 'recent' → apre il più recente (primo della lista).
  const resolvedOpen = initialOpenId === 'recent'
    ? (PROFILE_ORDERS[0]?.id || null)
    : (PROFILE_ORDERS.some(o => o.id === initialOpenId) ? initialOpenId : null);
  const [openId, setOpenId] = useState(resolvedOpen);
  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Storico ordini</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PROFILE_ORDERS.map(o => {
          const open = openId === o.id;
          return (
            <div key={o.id} style={{ background: TINT_X, borderRadius: 18, overflow: 'hidden' }}>
              <button onClick={() => setOpenId(open ? null : o.id)} style={{
                width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <div style={{
                  width: 66, height: 66, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                  backgroundImage: `url("${o.photo}")`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundColor: '#e8d9c9',
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.venue}</div>
                  <div style={{ fontSize: 11.5, color: MUTED_X, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>{o.address}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: TEXT_X }}>€ {o.total.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11.5, color: MUTED_X }}>{o.date}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>

              {open && (
                <div style={{ padding: '0 16px 16px', borderTop: `1px solid #EDE8EA`, animation: 'fade 0.15s ease' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '14px 0 10px' }}>
                    Cosa hai ordinato
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: SURF_X, borderRadius: 12, overflow: 'hidden' }}>
                    {o.items.map((it, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderBottom: i < o.items.length - 1 ? '1px solid #F0EAEC' : 'none',
                      }}>
                        <span style={{ fontSize: 13.5, color: TEXT_X }}>{it.n}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: TEXT_X, flexShrink: 0, marginLeft: 12 }}>€ {it.p.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderTop: '1.5px solid #EDE8EA',
                      background: TINT_X,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: MUTED_X }}>Totale</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: TEXT_X }}>€ {o.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <button style={{
                      padding: '9px 24px', background: SURF_X,
                      border: '1px solid #E0DADC', borderRadius: 999,
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 13, fontWeight: 600, color: TEXT_X,
                    }}>Scarica scontrino</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PagamentiView({ onBack, startAdd = false }) {
  const INITIAL = [
    { id: 'c1', type: 'visa',       label: 'Visa',        last4: '4242', expiry: '12/26', preferred: true  },
    { id: 'c2', type: 'mastercard', label: 'Mastercard',  last4: '8888', expiry: '03/25', preferred: false },
    { id: 'c3', type: 'applepay',   label: 'Apple Pay',   last4: null,   expiry: null,    preferred: false },
  ];
  const [cards, setCards] = useState(INITIAL);
  const [addOpen, setAddOpen] = useState(startAdd);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newNum, setNewNum] = useState('');
  const [newExp, setNewExp] = useState('');
  const [newCvv, setNewCvv] = useState('');

  const preferred = cards.find(c => c.preferred);
  const others = cards.filter(c => !c.preferred);

  function setPreferred(id) {
    setCards(prev => prev.map(c => ({ ...c, preferred: c.id === id })));
  }
  function remove(id) {
    setCards(prev => prev.filter(c => c.id !== id));
  }
  function addCard() {
    if (!newNum || !newExp) return;
    const last4 = newNum.replace(/\s/g, '').slice(-4);
    setCards(prev => [...prev, { id: `c${Date.now()}`, type: 'visa', label: 'Carta', last4, expiry: newExp, preferred: false }]);
    setNewNum(''); setNewExp(''); setNewCvv(''); setAddOpen(false);
  }

  const CardIcon = ({ type }) => {
    if (type === 'visa') return <span style={{ fontSize: 13, fontWeight: 900, color: '#1A1F71', letterSpacing: -0.5 }}>VISA</span>;
    if (type === 'mastercard') return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: 16, height: 16, borderRadius: 999, background: '#EB001B', marginRight: -6 }}/>
        <div style={{ width: 16, height: 16, borderRadius: 999, background: '#F79E1B' }}/>
      </div>
    );
    return <span style={{ fontSize: 11, fontWeight: 700, color: '#000' }}>🍎</span>;
  };

  return (
    <div style={{ animation: 'fade 0.2s ease', position: 'relative' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Pagamenti</div>

      {/* Metodo preferito */}
      {preferred && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Metodo preferito</div>
          <div style={{
            background: 'linear-gradient(135deg, #1F1A1B 0%, #3D2E32 100%)',
            borderRadius: 18, padding: '20px 20px 18px', marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}/>
            <div style={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, borderRadius: 999, background: 'rgba(255,255,255,0.04)' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Preferita</span>
              <CardIcon type={preferred.type}/>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: 3, marginBottom: 14 }}>
              •••• •••• •••• {preferred.last4}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {preferred.expiry ? `Scade ${preferred.expiry}` : ''}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{preferred.label}</span>
            </div>
          </div>
        </>
      )}

      {/* Altri metodi */}
      {others.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Altri metodi</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: TINT_X, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            {others.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                borderBottom: i < others.length - 1 ? '1px solid #EDE8EA' : 'none',
                background: SURF_X,
              }}>
                <div style={{ width: 38, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardIcon type={c.type}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_X }}>{c.label}{c.last4 ? ` •••• ${c.last4}` : ''}</div>
                  {c.expiry && <div style={{ fontSize: 11.5, color: MUTED_X, marginTop: 2 }}>Scade {c.expiry}</div>}
                </div>
                <button onClick={() => setPreferred(c.id)} style={{
                  fontSize: 12, fontWeight: 600, color: PINK_X,
                  background: CORALSURF_X, border: 'none', borderRadius: 999,
                  padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit',
                }}>Imposta preferita</button>
                <button onClick={() => setConfirmDelete(c.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Popup conferma eliminazione */}
      {confirmDelete && (
        <>
          <style>{`@keyframes confirmUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 20 }}/>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: SURF_X, borderRadius: '20px 20px 0 0',
            padding: '8px 20px 34px', zIndex: 21,
            animation: 'confirmUp 0.28s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{ width: 40, height: 4, background: MUTESURF_X, borderRadius: 999, margin: '8px auto 20px' }}/>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT_X, marginBottom: 6 }}>Rimuovi metodo di pagamento</div>
            <div style={{ fontSize: 13.5, color: MUTED_X, marginBottom: 24, lineHeight: 1.5 }}>
              Sei sicuro di voler rimuovere questa carta? L'operazione non è reversibile.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: '#D93025', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 15, fontWeight: 700, color: '#fff',
              }}>Rimuovi</button>
              <button onClick={() => setConfirmDelete(null)} style={{
                width: '100%', padding: '14px', borderRadius: 14,
                border: '1.5px solid #E0DADC', background: SURF_X,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 15, fontWeight: 600, color: TEXT_X,
              }}>Annulla</button>
            </div>
          </div>
        </>
      )}

      {/* Aggiungi */}
      {!addOpen ? (
        <button onClick={() => setAddOpen(true)} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          border: `1.5px dashed ${PINK_X}`, background: CORALSURF_X,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600, color: PINK_X,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Aggiungi metodo di pagamento
        </button>
      ) : (
        <div style={{ background: TINT_X, borderRadius: 16, padding: '16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_X, marginBottom: 14 }}>Nuova carta</div>
          {[
            { label: 'Numero carta', value: newNum, set: setNewNum, placeholder: '•••• •••• •••• ••••' },
            { label: 'Scadenza', value: newExp, set: setNewExp, placeholder: 'MM/AA' },
            { label: 'CVV', value: newCvv, set: setNewCvv, placeholder: '•••' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{f.label}</div>
              <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                style={{ width: '100%', padding: '11px 12px', background: SURF_X, border: '1.5px solid transparent', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = PINK_X}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setAddOpen(false)} style={{
              flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E0DADC',
              background: SURF_X, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: MUTED_X,
            }}>Annulla</button>
            <button onClick={addCard} style={{
              flex: 1.5, padding: '12px', borderRadius: 12, border: 'none',
              background: PINK_X, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: '#fff',
            }}>Aggiungi</button>
          </div>
        </div>
      )}
    </div>
  );
}

const PROFILE_PREFERITI = [
  { id: 'p1', name: 'Osteria Belli',        cuisine: 'Cucina romana',  zone: 'Trastevere',    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70&auto=format&fit=crop' },
  { id: 'p2', name: 'Al Settembrini',       cuisine: 'Ristorante',     zone: 'Prati',         photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70&auto=format&fit=crop' },
  { id: 'p3', name: 'Lounge 22',            cuisine: 'Cocktail bar',   zone: 'Centro Storico',photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=70&auto=format&fit=crop' },
];

function PreferitivView({ onBack, onOpenVenue }) {
  const [items, setItems] = useState(PROFILE_PREFERITI);

  function remove(id) {
    setItems(prev => prev.filter(v => v.id !== id));
  }

  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Preferiti</div>
        {items.length > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: PINK_X, background: CORALSURF_X, padding: '4px 12px', borderRadius: 999 }}>{items.length}</span>}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: MUTED_X }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: TEXT_X, marginBottom: 6 }}>Nessun locale salvato</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Salva i tuoi locali preferiti<br/>per ritrovarli qui.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(v => (
            <div key={v.id}
              onClick={() => onOpenVenue && onOpenVenue(v)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: TINT_X, borderRadius: 18, padding: '12px 14px', cursor: onOpenVenue ? 'pointer' : 'default' }}>
              <div style={{
                width: 58, height: 58, borderRadius: 14, flexShrink: 0,
                backgroundImage: `url("${v.photo}")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundColor: '#e8d9c9',
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                <div style={{ fontSize: 12, color: MUTED_X }}>{v.cuisine} · {v.zone}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(v.id); }} style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: CORALSURF_X, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={PINK_X} stroke={PINK_X} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SegnalaView({ onBack }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [testo, setTesto] = useState('');
  const [sent, setSent] = useState(false);

  function invia() {
    if (!stars && !testo.trim()) return;
    setSent(true);
  }

  if (sent) return (
    <div style={{ animation: 'fade 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 16 }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT_X }}>Grazie per il feedback!</div>
      <div style={{ fontSize: 14, color: MUTED_X, textAlign: 'center', lineHeight: 1.5 }}>Il tuo messaggio è stato inviato.<br/>Lo esamineremo al più presto.</div>
      <button onClick={onBack} style={{
        marginTop: 16, padding: '12px 28px', background: PINK_X,
        border: 'none', borderRadius: 999, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#fff',
      }}>Torna al profilo</button>
    </div>
  );

  const active = hovered || stars;

  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Segnala un problema</div>
      <div style={{ fontSize: 13.5, color: MUTED_X, marginBottom: 28, lineHeight: 1.5 }}>Aiutaci a migliorare byup. La tua opinione conta.</div>

      {/* Stelle */}
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Valutazione complessiva</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[1,2,3,4,5].map(i => (
          <button key={i}
            onClick={() => setStars(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
            <svg width="36" height="36" viewBox="0 0 24 24"
              fill={i <= active ? PINK_X : '#e0d8db'}
              style={{ transition: 'all 0.12s' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Testo */}
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Descrivi il problema</div>
      <textarea
        value={testo}
        onChange={e => setTesto(e.target.value)}
        placeholder="Es. non riesco a completare una prenotazione..."
        rows={5}
        style={{
          width: '100%', padding: '13px 14px', boxSizing: 'border-box',
          background: TINT_X, border: `1.5px solid ${testo ? PINK_X : 'transparent'}`,
          borderRadius: 12, fontSize: 14, color: TEXT_X, lineHeight: 1.55,
          fontFamily: 'inherit', outline: 'none', resize: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = PINK_X}
        onBlur={e => e.target.style.borderColor = testo ? PINK_X : 'transparent'}
      />
      <div style={{ fontSize: 11.5, color: MUTED_X, textAlign: 'right', marginTop: 6 }}>{testo.length} / 500</div>

      <button onClick={invia} style={{
        width: '100%', marginTop: 20, padding: '15px',
        background: (stars || testo.trim()) ? PINK_X : '#E8E3E5',
        border: 'none', borderRadius: 14,
        cursor: (stars || testo.trim()) ? 'pointer' : 'default',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
        color: (stars || testo.trim()) ? '#fff' : MUTED_X,
        transition: 'background 0.2s',
      }}>
        Invia
      </button>
    </div>
  );
}

function MieiDatiView({ onBack, onOpenPrivacy }) {
  // Grouped-inset alla Apple/Revolut: gruppi arrotondati con righe
  // label-valore, non un form. Il salvataggio compare solo quando serve.
  const INIZIALI = { nome: 'Mario', cognome: 'Rossi', genere: 'Uomo', nascita: '15/04/1990' };
  const [dati, setDati] = useState(INIZIALI);
  const [saved, setSaved] = useState(false);
  const dirty = Object.keys(INIZIALI).some(k => dati[k] !== INIZIALI[k]);
  const set = (k) => (v) => { setSaved(false); setDati(d => ({ ...d, [k]: v })); };
  const salva = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };


  const Gruppo = ({ label, children, footer }) => (
    <div style={{ marginBottom: 22 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 7px 14px' }}>{label}</div>}
      <div style={{ background: SURF_X, borderRadius: 14, overflow: 'hidden', border: `1px solid ${__BYUP_DK_X ? 'rgba(255,255,255,0.07)' : '#F0EAEC'}` }}>
        {children}
      </div>
      {footer && <div style={{ fontSize: 11.5, color: MUTED_X, lineHeight: 1.5, margin: '7px 14px 0' }}>{footer}</div>}
    </div>
  );
  const sep = { borderBottom: '1px solid ' + (__BYUP_DK_X ? 'rgba(255,255,255,0.06)' : '#F0EAEC') };

  const RigaCampo = ({ label, value, onChange, ultimo, icona }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', ...(ultimo ? {} : sep), cursor: 'text' }}>
      <span style={{ fontSize: 14.5, color: TEXT_X, width: 118, flexShrink: 0 }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} style={{
        flex: 1, minWidth: 0, textAlign: 'right',
        border: 'none', outline: 'none', background: 'transparent',
        fontSize: 14.5, fontWeight: 600, color: MUTED_X,
        fontFamily: 'inherit', padding: 0,
      }}/>
      {icona && <span style={{ display: 'inline-flex', color: MUTED_X, flexShrink: 0 }}>{icona}</span>}
    </label>
  );
  const IconaCalendario = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>
    </svg>
  );

  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>I miei dati</div>

      {/* ── Profilo ── */}
      <Gruppo label="Profilo">
        <RigaCampo label="Nome" value={dati.nome} onChange={set('nome')}/>
        <RigaCampo label="Cognome" value={dati.cognome} onChange={set('cognome')}/>
        <RigaCampo label="Data di nascita" value={dati.nascita} onChange={set('nascita')} icona={IconaCalendario}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px' }}>
          <span style={{ fontSize: 14.5, color: TEXT_X, width: 118, flexShrink: 0 }}>Genere</span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
            {['Uomo', 'Donna', 'Altro', 'N.D.'].map(g => {
              const on = dati.genere === g;
              return (
                <button key={g} onClick={() => set('genere')(g)} style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: `1.5px solid ${on ? PINK_X : (__BYUP_DK_X ? 'rgba(255,255,255,0.14)' : '#E4DDE0')}`,
                  background: on ? CORALSURF_X : 'transparent',
                  color: on ? PINK_X : MUTED_X,
                  fontSize: 12.5, fontWeight: on ? 700 : 500,
                  fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
                }}>{g}</button>
              );
            })}
          </div>
        </div>
      </Gruppo>

      {dirty && (
        <button onClick={salva} style={{
          width: '100%', margin: '-8px 0 22px', padding: '13px',
          background: saved ? '#30D158' : PINK_X, color: '#fff',
          border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14.5, fontWeight: 700, transition: 'background 0.3s',
          animation: 'fade 0.2s ease',
        }}>{saved ? 'Salvato ✓' : 'Salva modifiche'}</button>
      )}

      {/* ── Privacy e consensi ── */}
      <ConsensiPanel onOpenPrivacy={onOpenPrivacy} sep={sep}/>


    </div>
  );
}

function AccountFormView({ title, subtitle, fields, submitLabel, successMsg, onBack, footer }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f, i) => [i, f.defaultValue || ''])));
  const [done, setDone] = useState(false);

  function submit() {
    const filled = fields.every((f, i) => f.readOnly || values[i]?.trim());
    if (!filled) return;
    setDone(true);
  }

  const allFilled = fields.every((f, i) => f.readOnly || values[i]?.trim());

  if (done) return (
    <div style={{ animation: 'fade 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 14 }}>
      <div style={{ fontSize: 44 }}>✅</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_X, textAlign: 'center' }}>{successMsg}</div>
      <button onClick={onBack} style={{
        marginTop: 16, padding: '11px 28px', background: PINK_X,
        border: 'none', borderRadius: 999, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#fff',
      }}>Torna all'account</button>
    </div>
  );

  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: TINT_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: subtitle ? 6 : 28 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13.5, color: MUTED_X, marginBottom: 28, lineHeight: 1.5 }}>{subtitle}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map((f, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 2 }}>{f.label}</div>
            <input
              type={f.type || 'text'}
              value={values[i]}
              readOnly={f.readOnly}
              placeholder={f.placeholder}
              onChange={e => setValues(v => ({ ...v, [i]: e.target.value }))}
              style={{
                width: '100%', padding: '13px 14px', boxSizing: 'border-box',
                background: f.readOnly ? '#F0EEF0' : TINT_X,
                border: `1.5px solid transparent`,
                borderRadius: 12, fontSize: 15, color: f.readOnly ? MUTED_X : TEXT_X,
                fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!f.readOnly) e.target.style.borderColor = PINK_X; }}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>
        ))}
      </div>
      <button onClick={submit} style={{
        width: '100%', marginTop: 28, padding: '15px',
        background: allFilled ? PINK_X : '#E8E3E5',
        border: 'none', borderRadius: 14,
        cursor: allFilled ? 'pointer' : 'default',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
        color: allFilled ? '#fff' : MUTED_X,
        transition: 'background 0.2s',
      }}>{submitLabel}</button>
      {footer && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>{footer}</div>}
    </div>
  );
}

function LegalView({ title, content, onBack }) {
  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: SURF_X,
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTED_X, marginBottom: 28 }}>Aggiornato il 1 gennaio 2025</div>
      {content.map((block, i) => (
        <div key={i} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_X, marginBottom: 6 }}>{block.h}</div>
          <div style={{ fontSize: 13.5, color: MUTED_X, lineHeight: 1.65 }}>{block.p}</div>
        </div>
      ))}
    </div>
  );
}

// Tag profilo = traguardi sbloccati (equipaggiabili, max 2) + avatar preset
const PROFILE_TAGS = [
  { label: 'Pizza lover', img: 'assets/cat-pizza.png', bg: '#FCE9EE', c: '#E32459' },
  { label: 'Re dello spritz', img: 'assets/hero-spritz.png', bg: '#fae3de', c: '#4d122e' },
  { label: 'Esploratore', img: 'assets/cat-poke.png', bg: '#eef3d6', c: '#5f7000' },
  { label: 'byup pay', img: 'assets/coin.png', bg: '#f4f7d4', c: '#5f7000' },
];
const PROFILE_AVATARS = [
  'assets/avatar-default.png',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop',
];

function ProfileScreen({ onBack, onTabHome, onOpenVenue }) {
  // Deep-link: ?view=orders&order=<id|recent> apre direttamente una sotto-vista
  // (es. "Vedi scontrino" dalla schermata di pagamento → Storico ordini).
  const VIEWS = ['main','allergens','orders','account','terms','privacy','lingua','pagamenti','preferiti','miei-dati'];
  const params = (() => { try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); } })();
  const initialView = VIEWS.includes(params.get('view')) ? params.get('view') : 'main';
  const initialOrderId = params.get('order') || null;
  // ?add=1 (con view=pagamenti) apre direttamente "Aggiungi metodo di pagamento"
  // (es. "Aggiungi carta" dalla schermata Metodo pagamento del menu).
  const initialAddCard = params.get('add') === '1';
  const [view, setView] = useState(initialView); // 'main' | 'allergens' | 'orders' | 'account' | 'terms' | 'privacy' | 'lingua'
  const [tagSheet, setTagSheet] = useState(false);
  const [myTags, setMyTags] = useState(['Pizza lover', 'Re dello spritz']);
  const [avatarSheet, setAvatarSheet] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(PROFILE_AVATARS[0]);
  const nextAvatar = () => {
    const i = PROFILE_AVATARS.indexOf(avatarUrl);
    setAvatarUrl(PROFILE_AVATARS[(i + 1) % PROFILE_AVATARS.length]);
    setAvatarSheet(false);
  };
  const toggleTag = (l) => setMyTags(t => t.includes(l)
    ? t.filter(x => x !== l)
    : (t.length >= 2 ? [...t.slice(1), l] : [...t, l]));
  // Consumato il deep-link, lo rimuovo dall'URL così riaprendo il Profilo dal
  // tab si torna a 'main' (il param non resta "incollato").
  useEffect(() => {
    if (params.get('view') || params.get('order') || params.get('add')) {
      try {
        const p = new URLSearchParams(window.location.search);
        p.delete('view'); p.delete('order'); p.delete('add');
        const qs = p.toString();
        window.history.replaceState({}, '', 'byup Home.html' + (qs ? `?${qs}` : ''));
      } catch {}
    }
  }, []);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const logout = () => {
    try { localStorage.removeItem('byup_auth'); } catch {}
    window.location.href = 'byup Home.html?auth=login';
  };
  const [lang, setLang] = useState('it');
  const themeMode = (() => { try { return localStorage.getItem('byup.themeMode') || 'light'; } catch { return 'light'; } })();
  const cycleTheme = () => {
    const order = ['light', 'dark', 'auto'];
    const next = order[(order.indexOf(themeMode) + 1) % 3];
    try { localStorage.setItem('byup.themeMode', next); } catch {}
    // Ricarico restando sulla pagina Profilo (senza tornare alla Home)
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('page', 'profile');
      window.location.replace(u.href);
    } catch { window.location.reload(); }
  };
  const LANGS = [
    { code: 'it', flag: '🇮🇹', label: 'Italiano' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  ];
  const currentLang = LANGS.find(l => l.code === lang) || LANGS[0];
  const [allergenPrefs, setAllergenPrefs] = useState(() => {
    try { const raw = localStorage.getItem('byup_allergens'); return raw ? JSON.parse(raw) : { allergens: {}, diets: {} }; }
    catch { return { allergens: {}, diets: {} }; }
  });
  useEffect(() => {
    try { localStorage.setItem('byup_allergens', JSON.stringify(allergenPrefs)); } catch {}
  }, [allergenPrefs]);

  const Row = ({ label, iconBg, iconColor, iconSvg, onClick, danger, right }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: '11px 14px', background: 'transparent',
      border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    }}>
      {iconSvg && (
        <div style={{ width: 32, height: 32, borderRadius: 11, flexShrink: 0, background: iconBg || CORALSURF_X, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={iconColor || PINK_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {iconSvg}
          </svg>
        </div>
      )}
      <span style={{ flex: 1, fontSize: 16, color: danger ? '#c44' : TEXT_X, fontWeight: 500 }}>{label}</span>
      {right !== undefined ? right : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
    </button>
  );
  const RowGroup = ({ children }) => {
    const items = React.Children.toArray(children).filter(Boolean);
    return (
      <div style={{
        background: __BYUP_DK_X ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.75)', borderRadius: 20, overflow: 'hidden',
        border: '1px solid rgba(77,18,46,.07)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 12px 26px -22px rgba(77,18,46,.45)',
      }}>
        {items.map((child, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: TINT_X, marginLeft: 58 }}/>}
            {child}
          </React.Fragment>
        ))}
      </div>
    );
  };
  const QuickCard = ({ label, sub, img, iconSvg, iconColor, tint, onClick, delay = 0 }) => (
    <button className="bk-press" onClick={() => { try { window.ByupKit && window.ByupKit.haptic.selection(); } catch {} onClick && onClick(); }} style={{
      background: __BYUP_DK_X ? SURF_X : (tint || CORALSURF_X), borderRadius: 22,
      padding: '15px 14px 13px',
      border: '1px solid rgba(77,18,46,.06)', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      position: 'relative', overflow: 'hidden', minHeight: 116, textAlign: 'left',
      boxShadow: '0 14px 28px -20px rgba(227,36,89,.4)',
      animation: `bkFadeUp 480ms ${160 + delay}ms cubic-bezier(.22,.9,.35,1) backwards`,
    }}>
      <div aria-hidden style={{ position: 'absolute', right: -18, bottom: -18, width: 84, height: 84, borderRadius: 999, background: __BYUP_DK_X ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.5)' }}/>
      {img
        ? <img src={img} width="40" height="40" alt="" draggable={false} style={{ marginBottom: 9, filter: 'drop-shadow(0 6px 10px rgba(77,18,46,.18))', position: 'relative' }}/>
        : <div style={{ width: 40, height: 40, borderRadius: 14, background: __BYUP_DK_X ? (tint || 'rgba(255,255,255,.12)') : 'rgba(255,255,255,.8)', display: 'grid', placeItems: 'center', marginBottom: 9, position: 'relative' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={iconColor || PINK_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{iconSvg}</svg>
          </div>}
      <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15.5, color: TEXT_X, fontWeight: 600, position: 'relative' }}>{label}</span>
      {sub && <span style={{ fontSize: 11.5, color: MUTED_X, marginTop: 2, fontWeight: 700, position: 'relative' }}>{sub}</span>}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: 13, right: 11, opacity: .45 }}><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  );

  const activeAllergenCount =
    Object.values(allergenPrefs.allergens || {}).filter(Boolean).length +
    Object.values(allergenPrefs.diets || {}).filter(Boolean).length;

  return (
    <div style={{
      width: '100%', height: '100%', background: BG_X, position: 'relative',
      fontFamily: "'Hanken Grotesk', -apple-system, 'SF Pro Text', system-ui, sans-serif",
      color: TEXT_X, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div aria-hidden style={{ position: 'absolute', left: '50%', top: '-12%', width: '90%', aspectRatio: '1', transform: 'translateX(-50%)', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(227,36,89,.12) 0%, transparent 65%)' }}/>
      <div aria-hidden style={{ position: 'absolute', right: '-20%', bottom: '-10%', width: '60%', aspectRatio: '1', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(227,36,89,.1) 0%, transparent 68%)' }}/>
      <style>{`@keyframes profileSlideIn { from { transform: translateX(18px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <div style={{ flex: 1, overflowY: 'auto', padding: '60px 18px 120px' }}>
        {view === 'main' && (
          <div style={{ animation: 'fade 0.2s ease' }}>


            {/* Cover brand — magenta FISSO, non segue il tema */}
            <div style={{
              margin: '-60px -18px 0', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(165deg, #e32459 0%, #d21e50 100%)',
              borderRadius: '0 0 36px 36px',
              padding: '72px 18px 52px',
            }}>
              <div aria-hidden style={{ position: 'absolute', left: '-12%', top: '-30%', width: '65%', aspectRatio: '1', background: 'radial-gradient(circle, rgba(250,227,222,.26) 0%, transparent 65%)', pointerEvents: 'none' }}/>
              <div aria-hidden style={{ position: 'absolute', right: '-15%', bottom: '-35%', width: '70%', aspectRatio: '1', background: 'radial-gradient(circle, rgba(77,18,46,.32) 0%, transparent 65%)', pointerEvents: 'none' }}/>
              <button className="bk-press" onClick={onBack} style={{
                position: 'absolute', top: 64, left: 16,
                width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,.18)',
                border: '1px solid rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 106, height: 106 }}>
                  <div aria-hidden style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    background: 'conic-gradient(from 0deg, #fae3de, #ceff00, #ffffff, #ed9b9b, #fae3de)',
                    animation: 'bkSpinRing 7s linear infinite',
                    boxShadow: '0 16px 34px -12px rgba(77,18,46,.55)',
                  }}/>
                  <button onClick={() => setAvatarSheet(true)} style={{ position: 'absolute', inset: 4, borderRadius: 999, overflow: 'hidden', border: '3px solid #e32459', background: SURF_X, padding: 0, cursor: 'pointer' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}/>
                    ) : (
                      <span style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 600, color: '#E32459', background: '#FCE9EE' }}>MR</span>
                    )}
                  </button>
                  <span style={{ position: 'absolute', left: -4, bottom: 0, width: 30, height: 30, borderRadius: 999, background: '#fff', border: '2px solid #e32459', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', boxShadow: '0 4px 10px rgba(77,18,46,.3)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E32459" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.1"/></svg>
                  </span>
                  <img src="assets/mascot-wink.png" width="46" alt="" style={{
                    position: 'absolute', right: -20, bottom: -8, transform: 'rotate(8deg)',
                    filter: 'drop-shadow(0 6px 12px rgba(77,18,46,.45))',
                    animation: 'bkBob 3s ease-in-out infinite', pointerEvents: 'none',
                  }}/>
                </div>
                <button onClick={() => setView('account')} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0 2px',
                  fontFamily: 'inherit',
                }}>
                  <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 24, fontWeight: 600, color: '#fff' }}>Mario Rossi</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats che si sovrappongono alla cover */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'stretch', width: '100%', maxWidth: 320,
                marginTop: -28, position: 'relative', zIndex: 2,
                background: __BYUP_DK_X ? 'rgba(24,18,22,.62)' : 'rgba(255,255,255,.94)', border: __BYUP_DK_X ? '1px solid rgba(255,255,255,.12)' : '1px solid rgba(77,18,46,.08)',
                borderRadius: 20, padding: '11px 4px',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 18px 36px -20px rgba(77,18,46,.45)',
                animation: 'bkFadeUp 480ms 80ms cubic-bezier(.22,.9,.35,1) backwards',
              }}>
                {[['24', 'Ordini', () => setView('orders')], ['12', 'Preferiti', () => setView('preferiti')], ['1.240', 'Byuppini', () => { if (window.__byupNav) window.__byupNav.go('byuppini'); }]].map(([n, l, fn], i) => (
                  <React.Fragment key={l}>
                    {i > 0 && <div style={{ width: 1, background: 'rgba(77,18,46,.1)', margin: '4px 0' }}/>}
                    <button onClick={fn || undefined} style={{ flex: 1, background: 'none', border: 'none', cursor: fn ? 'pointer' : 'default', fontFamily: 'inherit', padding: '2px 0' }}>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 600, color: __BYUP_DK_X ? '#ffffff' : PINK_X, lineHeight: 1.1 }}>{n}</div>
                      <div style={{ fontSize: 11, color: MUTED_X, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginTop: 2 }}>{l}</div>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Tag sbloccati con i traguardi — tap per sceglierli */}
            <div style={{ display: 'flex', gap: 7, margin: '12px 0 20px', flexWrap: 'wrap', justifyContent: 'center', animation: 'bkFadeUp 480ms 140ms cubic-bezier(.22,.9,.35,1) backwards' }}>
              {myTags.map((l) => {
                const b = PROFILE_TAGS.find(t => t.label === l);
                if (!b) return null;
                return (
                  <button key={l} onClick={() => setTagSheet(true)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: b.bg, color: b.c, fontSize: 11.5, fontWeight: 800,
                    padding: '5px 11px', borderRadius: 999, letterSpacing: .3,
                    border: '1px solid rgba(77,18,46,.06)', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <img src={b.img} width="16" height="16" alt=""/>
                    {b.label}
                  </button>
                );
              })}
              <span style={{ display: 'inline-flex', alignItems: 'center', background: '#ceff00', color: '#141414', fontSize: 11.5, fontWeight: 800, padding: '5px 11px', borderRadius: 999, letterSpacing: .3, border: '1px solid rgba(77,18,46,.06)' }}>LIV. 3</span>
              <button onClick={() => setTagSheet(true)} aria-label="Modifica tag" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 27, height: 27,
                borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,.9)',
                border: '1.5px dashed rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'inherit',
              }}>+</button>
            </div>

            {/* Quick actions 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              <QuickCard label="Storico ordini" sub="24 ordini" tint="#FCE9EE" iconColor="#E32459" delay={0}
                iconSvg={<><path d="M5.5 3.2h10l3 3v14.6l-2.6-1.7-2.6 1.7-2.6-1.7-2.6 1.7-2.6-1.7-2.6 1.7V5.2a2 2 0 0 1 2-2z" transform="translate(1.5 0)"/><path d="M9.5 9h6M9.5 13h6" transform="translate(0 0)"/></>}
                onClick={() => setView('orders')}/>
              <QuickCard label="Dieta & allergeni" sub={activeAllergenCount > 0 ? activeAllergenCount + ' filtri attivi' : 'Imposta ora'} tint="#FEF0E3" iconColor="#C85C1A" delay={60}
                iconSvg={<><path d="M5 19.5C5 10 11.5 4.5 20 4.5c0 9.5-5.5 15-15 15z"/><path d="M5 19.5c3.5-4 7-7.5 10-9.5"/></>}
                onClick={() => setView('allergens')}/>
              <QuickCard label="Preferiti" sub="12 locali" tint="#F9E3EE" iconColor="#E32459" delay={120}
                iconSvg={<path d="M12 20.6s-6.8-4.3-8.7-9.1C1.9 7.9 4.3 4.6 7.7 4.6c1.9 0 3.3.9 4.3 2.3 1-1.4 2.4-2.3 4.3-2.3 3.4 0 5.8 3.3 4.4 6.9-1.9 4.8-8.7 9.1-8.7 9.1z"/>}
                onClick={() => setView('preferiti')}/>
              <QuickCard label="Pagamenti" sub="byup pay" tint="#f4f7d4" iconColor="#5f7000" delay={180}
                iconSvg={<><rect x="2.5" y="5" width="19" height="14" rx="3.5"/><path d="M2.5 10.2h19"/><path d="M6.5 15h4.5"/></>}
                onClick={() => setView('pagamenti')}/>
            </div>

            <div style={{ height: 14 }}/>

            <RowGroup>
              <Row label="Lingua" onClick={() => setView('lingua')}
                iconBg="#FCE9EE" iconColor={PINK_X}
                right={<span style={{ fontSize: 15, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{currentLang.flag} {currentLang.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>}
                iconSvg={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}/>
              <Row label="I miei dati" onClick={() => setView('miei-dati')}
                iconBg="#FCE9EE" iconColor={PINK_X}
                iconSvg={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>
              <Row label="Termini e condizioni" onClick={() => setView('terms')}
                iconBg="#FCE9EE" iconColor={PINK_X}
                iconSvg={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}/>
              <Row label="Privacy policy" onClick={() => setView('privacy')}
                iconBg="#FCE9EE" iconColor={PINK_X}
                iconSvg={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}/>
              <Row label="Tema (prototipo)" onClick={cycleTheme}
                iconBg="#f4f7d4" iconColor="#5f7000"
                right={<span style={{ fontSize: 12, fontWeight: 800, color: PINK_X, background: CORALSURF_X, padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: .5 }}>{themeMode}</span>}
                iconSvg={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>}/>
            </RowGroup>

            <div style={{ height: 14 }}/>

            <RowGroup>
              <Row label="Segnala un problema" onClick={() => setView('segnala')}
                iconBg="#FCE9EE" iconColor={PINK_X}
                iconSvg={<><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
            </RowGroup>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button className="bk-press" onClick={() => setConfirmLogout(true)} style={{
                padding: '8px 12px', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, color: MUTED_X,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>Esci</button>
            </div>

          </div>
        )}

        {view === 'account' && (
          <div className="acct-view-x" style={{ animation: 'fade 0.2s ease', position: 'relative' }}>
            <button onClick={() => setView('main')} style={{
              width: 36, height: 36, borderRadius: 999, background: TINT_X,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginBottom: 22,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Account</div>
            <div style={{ fontSize: 13, color: MUTED_X, marginBottom: 24 }}>mario.rossi@email.it · N° 00001</div>
            <RowGroup>
              <Row label="Cambia password" onClick={() => setView('cambia-password')}
                iconColor={PINK_X}
                iconSvg={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>
              <Row label="Modifica email" onClick={() => setView('modifica-email')}
                iconColor={PINK_X}
                iconSvg={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>
            </RowGroup>

            {/* Elimina account: staccato dal gruppo, entra dal fondo dello schermo */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 24,
              display: 'flex', justifyContent: 'center', pointerEvents: 'none',
              animation: 'slideUpDanger .5s .15s cubic-bezier(.2,1.1,.3,1) backwards',
            }}>
              <style>{`@keyframes slideUpDanger{from{transform:translateY(90px);opacity:0}to{transform:translateY(0);opacity:1}}
.acct-view-x{min-height:620px}
@media (hover:none) and (pointer:coarse){.acct-view-x{min-height:650px}}`}</style>
              <button onClick={() => setConfirmDeleteAccount(true)} style={{
                pointerEvents: 'auto',
                padding: '8px 12px', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, color: MUTED_X,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>Elimina account</button>
            </div>

          </div>
        )}

        {view === 'gestione' && (
          <div style={{ animation: 'fade 0.2s ease' }}>
            <button onClick={() => setView('account')} style={{
              width: 36, height: 36, borderRadius: 999, background: SURF_X,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 22,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Gestione Account</div>
            <RowGroup>
              <Row label="Cambia password"
                iconBg="#EEF3FF" iconColor="#007AFF"
                iconSvg={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>
              <Row label="Recupera password"
                iconBg="#FFF8EE" iconColor="#FF9500"
                iconSvg={<><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
              <Row label="Modifica email"
                iconBg="#F3EEFF" iconColor="#9B3DD8"
                iconSvg={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>
            </RowGroup>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <button style={{
                padding: '8px 24px', background: MUTESURF_X,
                border: '1px solid #000', borderRadius: 999,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, color: '#000',
              }}>
                Elimina account
              </button>
            </div>
          </div>
        )}

        {view === 'cambia-password' && (
          <AccountFormView
            title="Cambia password"
            onBack={() => setView('account')}
            fields={[
              { label: 'Password attuale', placeholder: '••••••••', type: 'password' },
              { label: 'Nuova password', placeholder: '••••••••', type: 'password' },
              { label: 'Conferma nuova password', placeholder: '••••••••', type: 'password' },
            ]}
            submitLabel="Salva password"
            successMsg="Password aggiornata con successo."
            footer={
              <button onClick={() => setView('recupera-password')} style={{
                background: 'none', border: 'none', padding: '6px 10px',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 500,
                color: __BYUP_DK_X ? 'rgba(246,236,233,.5)' : '#9a9096',
              }}>Hai dimenticato la password? <span style={{ color: PINK_X, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Recuperala ora</span></button>
            }
          />
        )}

        {view === 'recupera-password' && (
          <AccountFormView
            title="Recupera password"
            subtitle="Ti invieremo un link per reimpostare la password."
            onBack={() => setView('account')}
            fields={[
              { label: 'La tua email', placeholder: 'mario.rossi@email.it', type: 'email', defaultValue: 'mario.rossi@email.it' },
            ]}
            submitLabel="Invia link di recupero"
            successMsg="Email inviata. Controlla la tua casella di posta."
          />
        )}

        {view === 'modifica-email' && (
          <AccountFormView
            title="Modifica email"
            onBack={() => setView('account')}
            fields={[
              { label: 'Email attuale', placeholder: 'mario.rossi@email.it', type: 'email', defaultValue: 'mario.rossi@email.it', readOnly: true },
              { label: 'Nuova email', placeholder: 'nuova@email.it', type: 'email' },
              { label: 'Conferma nuova email', placeholder: 'nuova@email.it', type: 'email' },
              { label: 'Password', placeholder: '••••••••', type: 'password' },
            ]}
            submitLabel="Aggiorna email"
            successMsg="Email aggiornata con successo."
          />
        )}

        {view === 'pagamenti' && (
          <PagamentiView onBack={() => setView('main')} startAdd={initialAddCard}/>
        )}

        {view === 'preferiti' && (
          <PreferitivView onBack={() => setView('main')} onOpenVenue={onOpenVenue}/>
        )}

        {view === 'segnala' && (
          <SegnalaView onBack={() => setView('account')}/>
        )}

        {view === 'miei-dati' && (
          <MieiDatiView onBack={() => setView('main')} onOpenPrivacy={() => setView('privacy')}/>
        )}

        {view === 'terms' && (
          <LegalView title="Termini e condizioni" onBack={() => setView('main')} content={[
            { h: 'Accettazione dei termini', p: 'Utilizzando byup accetti integralmente i presenti Termini e Condizioni. Se non li accetti, ti preghiamo di non utilizzare il servizio. byup si riserva il diritto di modificarli in qualsiasi momento; le modifiche saranno efficaci dalla pubblicazione sull\'app.' },
            { h: 'Descrizione del servizio', p: 'byup è una piattaforma digitale che consente agli utenti di scoprire ristoranti, consultare menu e effettuare prenotazioni. Il servizio è disponibile per utenti maggiorenni registrati con un account personale.' },
            { h: 'Prenotazioni e cancellazioni', p: 'Le prenotazioni effettuate tramite byup sono vincolanti. La cancellazione è gratuita fino a 2 ore prima dell\'orario prenotato. Cancellazioni tardive o mancata presentazione (no-show) ripetuti possono comportare la sospensione temporanea del servizio di prenotazione.' },
            { h: 'Responsabilità', p: 'byup funge da intermediario tra utente e ristoratore. Non siamo responsabili di variazioni di menu, prezzi, orari o qualità del servizio reso dai locali partner. In caso di problemi con una prenotazione, contatta il supporto entro 24 ore.' },
            { h: 'Proprietà intellettuale', p: 'Tutti i contenuti presenti su byup (logo, testi, immagini, interfaccia) sono di proprietà di byup S.r.l. o dei rispettivi titolari. È vietata qualsiasi riproduzione o utilizzo non autorizzato.' },
            { h: 'Legge applicabile', p: 'I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente in via esclusiva il Foro di Roma.' },
          ]}/>
        )}

        {view === 'privacy' && (
          <LegalView title="Privacy policy" onBack={() => setView('main')} content={[
            { h: 'Titolare del trattamento', p: 'byup S.r.l., con sede legale in Via del Corso 10, 00186 Roma (RM), C.F. / P.IVA 12345678901, è il titolare del trattamento dei dati personali raccolti tramite questa applicazione. Contatto DPO: privacy@byup.it' },
            { h: 'Dati raccolti', p: 'Raccogliamo i dati che fornisci durante la registrazione (nome, cognome, e-mail, numero di telefono), i dati di navigazione e utilizzo dell\'app (pagine visitate, preferenze, ricerche), i dati delle prenotazioni e le preferenze alimentari (allergeni, diete) che scegli di inserire volontariamente.' },
            { h: 'Finalità e base giuridica', p: 'I dati sono trattati per: (a) eseguire il contratto di servizio (art. 6.1.b GDPR); (b) adempiere a obblighi legali (art. 6.1.c GDPR); (c) inviarti comunicazioni promozionali, anche personalizzate sul tuo storico ordini su byup, solo previo tuo consenso (art. 6.1.a GDPR); le offerte basate sulle preferenze alimentari richiedono un consenso separato ed esplicito (art. 9.2.a GDPR).' },
            { h: 'Conservazione', p: 'I dati dell\'account sono conservati per tutta la durata del rapporto contrattuale e per i successivi 10 anni per obblighi fiscali. I dati di navigazione sono conservati per un massimo di 13 mesi.' },
            { h: 'I tuoi diritti', p: 'Hai diritto di accedere, rettificare, cancellare e portare i tuoi dati (artt. 15-20 GDPR). Puoi opporti al trattamento o chiedere la limitazione in qualsiasi momento scrivendo a privacy@byup.it. Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).' },
            { h: 'Suggerimenti personalizzati', p: 'Per proporti locali e piatti in linea con i tuoi gusti usiamo, sulla base del nostro legittimo interesse (art. 6.1.f GDPR), i gusti che dichiari nel profilo, il tuo storico ordini su byup e la città del tuo contesto d\'uso corrente (posizione usata al volo o città selezionata). Non usiamo mai allergeni o preferenze alimentari, né i log di accesso registrati per sicurezza. Puoi disattivare i suggerimenti personalizzati in qualsiasi momento da \u201cI miei dati\u201d: torneranno proposte generiche.' },
            { h: 'Sicurezza dell\'account (accessi)', p: 'Per proteggere il tuo account, prevenire abusi e fornirti assistenza registriamo gli eventi di accesso all\'app: data e ora, indirizzo IP, città stimata e tipo di dispositivo. La base giuridica è il legittimo interesse (art. 6.1.f GDPR); NON registriamo né conserviamo un tracciato dei tuoi spostamenti. Gli eventi sono conservati per 12 mesi e sono visibili nella sezione \u201cI miei dati\u201d del profilo. Puoi opporti al trattamento scrivendo a privacy@byup.it.' },
            { h: 'Cookie e tecnologie simili', p: 'L\'app utilizza cookie tecnici essenziali al funzionamento e, previo tuo consenso, cookie analitici (Google Analytics) e cookie di profilazione per personalizzare i contenuti. Puoi gestire le preferenze dalla sezione "I miei dati" del profilo.' },
            { h: 'Trasferimenti internazionali', p: 'Alcuni fornitori di servizi (es. infrastruttura cloud) potrebbero trattare dati al di fuori dell\'UE. In tal caso garantiamo adeguate salvaguardie tramite Clausole Contrattuali Standard approvate dalla Commissione Europea.' },
          ]}/>
        )}

        {view === 'allergens' && (
          <AllergensView onBack={() => setView('main')}
            prefs={allergenPrefs} setPrefs={setAllergenPrefs}/>
        )}

        {view === 'orders' && (
          <OrdersView onBack={() => setView('main')} initialOpenId={initialOrderId}/>
        )}

        {view === 'lingua' && (
          <div style={{ animation: 'fade 0.2s ease' }}>
            <button onClick={() => setView('main')} style={{
              width: 36, height: 36, borderRadius: 999, background: TINT_X,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginBottom: 22,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Lingua</div>
            <div style={{ fontSize: 14, color: MUTED_X, marginBottom: 24 }}>Scegli la lingua dell'app e dei menu tradotti.</div>
            <RowGroup>
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '15px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 24 }}>{l.flag}</span>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: TEXT_X }}>{l.label}</span>
                  {lang === l.code && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              ))}
            </RowGroup>
          </div>
        )}
      </div>

      {/* Shared bottom tab bar (no QR) */}
      {/* Sheet: scegli i tuoi tag (dai traguardi sbloccati) */}
      {tagSheet && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setTagSheet(false); }} style={{
          position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(15,8,12,.5)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fade .2s ease' }}>
          <div style={{ width: '100%', background: SURF_X, borderRadius: '24px 24px 0 0',
            padding: '12px 20px calc(26px + env(safe-area-inset-bottom, 0px))', animation: 'slideUp .28s cubic-bezier(.2,.9,.3,1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 38, height: 4, borderRadius: 999, background: BORDER_X }}/>
            </div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 600, color: TEXT_X }}>I tuoi tag</div>
            <div style={{ fontSize: 12.5, color: MUTED_X, margin: '3px 0 14px' }}>Si sbloccano con i traguardi Byuppini · scegline due da mostrare</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {PROFILE_TAGS.map((b) => {
                const on = myTags.includes(b.label);
                return (
                  <button key={b.label} onClick={() => toggleTag(b.label)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: on ? b.bg : 'transparent', color: on ? b.c : MUTED_X,
                    fontSize: 12.5, fontWeight: 800, padding: '8px 14px', borderRadius: 999,
                    border: on ? '1.5px solid rgba(77,18,46,.14)' : `1.5px dashed ${BORDER_X}`,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                  }}>
                    <img src={b.img} width="17" height="17" alt="" style={{ filter: on ? 'none' : 'grayscale(1)', opacity: on ? 1 : .55 }}/>
                    {b.label}
                    {on && <span style={{ fontSize: 11 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <button className="bk-press" onClick={() => setTagSheet(false)} style={{
              width: '100%', height: 50, border: 'none', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: '#fff',
              background: 'linear-gradient(122deg, #E32459 0%, #B81C47 100%)',
              boxShadow: '0 14px 30px -12px rgba(227,36,89,.55)' }}>Fatto</button>
          </div>
        </div>
      )}

      {/* Sheet: foto profilo */}
      {avatarSheet && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setAvatarSheet(false); }} style={{
          position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(15,8,12,.5)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fade .2s ease' }}>
          <div style={{ width: '100%', background: SURF_X, borderRadius: '24px 24px 0 0',
            padding: '12px 20px calc(26px + env(safe-area-inset-bottom, 0px))', animation: 'slideUp .28s cubic-bezier(.2,.9,.3,1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 38, height: 4, borderRadius: 999, background: BORDER_X }}/>
            </div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 600, color: TEXT_X, marginBottom: 12 }}>Foto profilo</div>
            {[
              ['Scatta una foto', nextAvatar, false],
              ['Scegli dalla libreria', nextAvatar, false],
              ['Rimuovi foto', () => { setAvatarUrl(null); setAvatarSheet(false); }, true],
            ].map(([l, fn, danger]) => (
              <button key={l} onClick={fn} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '14px 4px',
                background: 'none', border: 'none', borderBottom: `1px solid ${BORDER_X}`,
                fontSize: 15, fontWeight: 700, color: danger ? '#d21e50' : TEXT_X,
                cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
            ))}
            <button onClick={() => setAvatarSheet(false)} style={{
              display: 'block', width: '100%', padding: '15px 4px 4px', background: 'none', border: 'none',
              fontSize: 14, fontWeight: 700, color: MUTED_X, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>Annulla</button>
          </div>
        </div>
      )}

      {(() => { const B = window.BottomTabBar; return B ? <B active="profile" onHome={onTabHome} onProfile={() => {}}/> : null; })()}
      {(() => { const K = window.ByupKit; return K ? <K.MascotMoment absolute pose="confident" pageKey="profile" message="Qui comandi tu." bottom={112} size={116}/> : null; })()}

      {/* Dialog centrati (alert), a livello schermo — non bottom-sheet */}
      {(confirmLogout || confirmDeleteAccount) && (
        <div onClick={() => { setConfirmLogout(false); setConfirmDeleteAccount(false); }} style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 28px', animation: 'fade 0.18s ease',
        }}>
          <style>{`@keyframes popIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', maxWidth: 320, background: SURF_X, borderRadius: 22,
            padding: '24px 22px 18px', textAlign: 'center',
            boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
            animation: 'popIn 0.2s cubic-bezier(0.2,0.9,0.3,1.1)',
          }}>
            {confirmLogout ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEXT_X, marginBottom: 8 }}>Uscire dall'account?</div>
                <div style={{ fontSize: 13.5, color: MUTED_X, lineHeight: 1.5, marginBottom: 22 }}>
                  Dovrai accedere di nuovo per ordinare e pagare. I tuoi dati restano salvati.
                </div>
                <button onClick={logout} style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: PINK_X, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8,
                }}>Sì, esci</button>
                <button onClick={() => setConfirmLogout(false)} style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 600, color: MUTED_X,
                }}>Annulla</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEXT_X, marginBottom: 8 }}>Eliminare l'account?</div>
                <div style={{ fontSize: 13.5, color: MUTED_X, lineHeight: 1.5, marginBottom: 22 }}>
                  Tutti i tuoi dati, preferenze e storico ordini verranno eliminati definitivamente. Questa operazione non è reversibile.
                </div>
                <button style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: '#D93025', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8,
                }}>Sì, elimina il mio account</button>
                <button onClick={() => setConfirmDeleteAccount(false)} style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 600, color: MUTED_X,
                }}>Annulla</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Booking sheet ──────────────────────────────────────────
function BookingSheet({ open, venue, defaultTime, editBooking, onClose, onConfirm, onCancelBooking }) {
  // Redesign UX: una sola schermata, tre scelte visive (quando · ora · quanti),
  // dati personali già compilati e ripiegati, riepilogo sempre visibile nel footer.
  const isEdit = !!editBooking;
  const [step, setStep] = useState(0); // 0 form, 1 success
  const [date, setDate] = useState('Oggi');
  const [time, setTime] = useState(defaultTime || '20:30');
  const [people, setPeople] = useState(2);
  const [name, setName] = useState('Mario Rossi');
  const [phone, setPhone] = useState('+39 333 1234567');
  const [note, setNote] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setDetailsOpen(false);
      if (editBooking) {
        setDate(editBooking.date || 'Oggi');
        setTime(editBooking.time || '20:30');
        setPeople(editBooking.people || 2);
        setName(editBooking.name || 'Mario Rossi');
        setPhone(editBooking.phone || '+39 333 1234567');
        setNote(editBooking.note || '');
        setPrefilled(false);
      } else if (defaultTime) { setTime(defaultTime); setPrefilled(true); }
      else setPrefilled(false);
    }
  }, [open, defaultTime, editBooking]);
  if (!open) return null;

  const dates = ['Oggi', 'Domani', 'Sab 11', 'Dom 12', 'Lun 13', 'Mar 14'];
  const lunch = ['12:30', '13:00', '13:30'];
  const dinner = ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
  const chip = (active) => ({
    padding: '11px 0', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 14, fontWeight: 800, textAlign: 'center', transition: 'all .15s',
    background: active ? 'linear-gradient(122deg, #E32459 0%, #B81C47 100%)' : TINT_X,
    color: active ? '#fff' : TEXT_X,
    border: active ? '1.5px solid transparent' : `1.5px solid ${BORDER_X}`,
    boxShadow: active ? '0 8px 18px -8px rgba(227,36,89,.6)' : 'none',
  });
  const label = (t) => (
    <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED_X, margin: '16px 0 8px',
      textTransform: 'uppercase', letterSpacing: .6 }}>{t}</div>
  );

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '90%', background: SURF_X, borderTopLeftRadius: 26, borderTopRightRadius: 26,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'slideUp .3s cubic-bezier(.2,.9,.3,1)',
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: MUTESURF_X, margin: '10px auto 0', flexShrink: 0 }}/>

        {step === 0 ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 12px' }}>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 23, fontWeight: 600, color: TEXT_X, letterSpacing: -.3, lineHeight: 1.1 }}>
                {isEdit ? 'Modifica prenotazione' : 'Prenota un tavolo'}
              </div>
              <div style={{ fontSize: 13, color: MUTED_X, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {venue?.name || editBooking?.venue || 'Ristorante'}
                {prefilled && <span style={{ color: PINK_X, fontWeight: 700 }}>· slot scelto dalla home</span>}
              </div>

              {label('Quando')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {dates.map(d => (
                  <button key={d} onClick={() => setDate(d)} style={chip(date === d)}>{d}</button>
                ))}
              </div>

              {label('A che ora')}
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED_X, marginBottom: 6 }}>☀️ Pranzo</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {lunch.map(t => (
                  <button key={t} onClick={() => setTime(t)} style={chip(time === t)}>{t}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED_X, marginBottom: 6 }}>🌙 Cena</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {dinner.map(t => (
                  <button key={t} onClick={() => setTime(t)} style={chip(time === t)}>{t}</button>
                ))}
              </div>

              {label('In quanti')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => setPeople(n)} style={chip(people === n)}>{n}</button>
                ))}
              </div>
              <button onClick={() => setPeople(p => Math.min(20, p + 1))} style={{
                marginTop: 8, background: 'none', border: 'none', color: people > 6 ? PINK_X : MUTED_X,
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}>
                {people > 6 ? `${people} persone · tocca per aggiungere` : 'Siete di più? Tocca qui'}
              </button>

              {/* Dati già compilati, ripiegati */}
              <div style={{ marginTop: 14, background: TINT_X, borderRadius: 16, border: `1px solid ${BORDER_X}`, overflow: 'hidden' }}>
                <button onClick={() => setDetailsOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 999, background: PINK_X, color: '#fff', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>MR</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: TEXT_X }}>{name}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: MUTED_X }}>{phone}{note ? ' · con note' : ''}</span>
                  </span>
                  <span style={{ fontSize: 12, color: PINK_X, fontWeight: 800 }}>{detailsOpen ? 'Chiudi' : 'Modifica'}</span>
                </button>
                {detailsOpen && (
                  <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Input value={name} onChange={setName}/>
                    <Input value={phone} onChange={setPhone}/>
                    <Input value={note} onChange={setNote} placeholder="Note: allergie, occasioni, preferenze..." multi/>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: riepilogo + conferma sempre visibili */}
            <div style={{ flexShrink: 0, padding: '10px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
              background: SURF_X, boxShadow: '0 -8px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 13, fontWeight: 700, color: MUTED_X, marginBottom: 9 }}>
                <span style={{ color: TEXT_X }}>{date}</span>·<span style={{ color: TEXT_X }}>{time}</span>·
                <span style={{ color: TEXT_X }}>{people} {people === 1 ? 'persona' : 'persone'}</span>
              </div>
              <button className="bk-press" onClick={() => {
                try {
                  localStorage.setItem('byup_booking', JSON.stringify({
                    venue: venue?.name || editBooking?.venue || 'Ristorante',
                    date, time, people, name, phone, note,
                    createdAt: Date.now(),
                  }));
                } catch {}
                setStep(1);
              }} style={{
                width: '100%', height: 54,
                background: 'linear-gradient(122deg, #E32459 0%, #B81C47 100%)', color: '#fff',
                border: 'none', borderRadius: 999, fontSize: 15.5, fontWeight: 800, letterSpacing: '.01em',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 16px 34px -12px rgba(227,36,89,.62), inset 0 1px 0 rgba(255,255,255,.30)',
              }}>{isEdit ? 'Salva modifiche' : 'Conferma prenotazione'}</button>
              {isEdit && (
                <button onClick={() => onCancelBooking && onCancelBooking()} style={{
                  width: '100%', marginTop: 9, height: 48, background: 'transparent', color: '#c0392b',
                  border: '1.5px solid #ecc9c4', borderRadius: 999, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Annulla prenotazione</button>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '20px 20px calc(28px + env(safe-area-inset-bottom, 0px))', textAlign: 'center', overflowY: 'auto' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: __BYUP_DK_X ? 'rgba(20,130,64,.20)' : '#E8F5E9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a8a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: TEXT_X }}>{isEdit ? 'Prenotazione aggiornata' : 'Prenotazione confermata'}</div>
            <div style={{ fontSize: 14, color: MUTED_X, marginBottom: 20 }}>
              Ti aspettiamo {date.toLowerCase()} alle {time} per {people} {people === 1 ? 'persona' : 'persone'}.
            </div>
            <div style={{ background: BG_X, borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 16 }}>
              <RowKV k="Locale" v={venue?.name || editBooking?.venue || 'Ristorante'}/>
              <RowKV k="Data" v={date}/>
              <RowKV k="Orario" v={time}/>
              <RowKV k="Partecipanti" v={people}/>
              <RowKV k="A nome di" v={name}/>
              {note && <RowKV k="Note" v={note}/>}
            </div>
            <div style={{ fontSize: 12, color: MUTED_X, marginBottom: 12 }}>Riceverai un promemoria un'ora prima.</div>
            <button onClick={() => { onConfirm?.({ date, time, people, name, phone, note }); }} style={{
              width: '100%', height: 50, background: PINK_X, color: '#fff',
              border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(227,36,89,0.3)',
            }}>Chiudi</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED_X, marginBottom: 9, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</div>
      {children}
    </div>
  );
}
function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', padding: '9px 16px', borderRadius: 999,
      background: active ? 'linear-gradient(122deg, #E32459 0%, #B81C47 100%)' : SURF_X,
      color: active ? '#fff' : TEXT_X,
      border: `1.5px solid ${active ? 'transparent' : BORDER_X}`, fontSize: 13, fontWeight: 700,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      boxShadow: active ? '0 8px 18px -8px rgba(227,36,89,.6)' : 'none',
      transition: 'background 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
    }}>{children}</button>
  );
}
function Input({ value, onChange, placeholder, multi }) {
  const Tag = multi ? 'textarea' : 'input';
  return (
    <Tag value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={multi ? 3 : undefined}
      onFocus={(e) => { e.target.style.borderColor = PINK_X; e.target.style.background = SURF_X; }}
      onBlur={(e) => { e.target.style.borderColor = BORDER_X; e.target.style.background = TINT_X; }}
      style={{
      width: '100%', padding: '13px 15px', borderRadius: 14, border: `1.5px solid ${BORDER_X}`,
      fontSize: 14.5, fontFamily: 'inherit', resize: 'none', background: TINT_X, color: TEXT_X,
      outline: 'none', boxSizing: 'border-box', transition: 'border-color 140ms ease, background 140ms ease',
    }}/>
  );
}
function RowKV({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
      <span style={{ color: MUTED_X }}>{k}</span>
      <span style={{ color: TEXT_X, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

// ─── Venue screen (vetrina locale) — dispatcher degli STILI ──
// Il locale può avere stili di vetrina diversi. In produzione lo stile sarà
// scelto dal RISTORATORE nel gestionale e arriverà dal backend insieme ai dati
// del locale. Qui (prototipo, nessun backend) lo stile si forza via:
//   • URL  ?venue=original|premium   → utile per ShortcutsPanel / demo
//   • window.__venueVariant = '…'    → override da console
// Default = 'original' (stile classico, definito sotto in questo file).
// Lo stile 'premium' vive in venue-variants.jsx. Vedi Contesto-App.md §3.1.
function VenueScreen(props) {
  const variant = (() => {
    try {
      const v = new URLSearchParams(window.location.search).get('venue');
      if (['original','premium'].includes(v)) return v;
    } catch {}
    return window.__venueVariant || null;
  })();
  // Vetrina Premium: forzata via ?venue=premium oppure automatica per i
  // locali selezionati da byup (flag `premium` sui dati del locale).
  if ((variant === 'premium' || (!variant && props.venue && props.venue.premium)) && window.VenuePremium) {
    return <window.VenuePremium {...props}/>;
  }
  return <VenueOriginal {...props}/>;                                         // Classico (default)
}

function VenueMapThumbnail({ lat, lng }) {
  const divRef = useRef(null);
  useEffect(() => {
    if (!window.L || !divRef.current) return;
    const map = window.L.map(divRef.current, {
      center: [lat, lng], zoom: 15,
      zoomControl: false, attributionControl: false,
      dragging: false, scrollWheelZoom: false,
      touchZoom: false, doubleClickZoom: false, keyboard: false,
    });
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
    const pin = `<div style="width:14px;height:14px;border-radius:50%;background:#E32459;border:3px solid #fff;box-shadow:0 2px 8px rgba(227,36,89,0.55)"></div>`;
    window.L.marker([lat, lng], {
      icon: window.L.divIcon({ className: '', html: pin, iconSize: [14,14], iconAnchor: [7,7] }),
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 60);
    return () => map.remove();
  }, [lat, lng]);
  return <div ref={divRef} style={{ width: '100%', height: '100%' }}/>;
}

// Stack 9:16 stile "Da scoprire": auto ogni 1.5s finché non si clicca, poi manuale.
function ReelStack({ items }) {
  const n = items.length;
  const [cur, setCur] = useState(0);
  const [dx, setDx] = useState(0);
  const stoppedRef = useRef(false);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (stoppedRef.current || dragRef.current) return;
      setCur(c => (c + 1) % n);
    }, 1500);
    return () => clearInterval(t);
  }, [n]);
  const getX = (e) => e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX) ?? 0;
  const onDown = (e) => { stoppedRef.current = true; movedRef.current = false; dragRef.current = { x: getX(e) }; };
  const onMove = (e) => {
    if (!dragRef.current) return;
    const d = getX(e) - dragRef.current.x;
    if (Math.abs(d) > 6) movedRef.current = true;
    setDx(d);
  };
  const onUp = () => {
    if (!dragRef.current) return;
    const d = dx; dragRef.current = null; setDx(0);
    if (d < -40) setCur(c => (c + 1) % n);
    else if (d > 40) setCur(c => (c - 1 + n) % n);
  };
  const rel = (i) => { let r = (i - cur) % n; if (r > n / 2) r -= n; if (r < -n / 2) r += n; return r; };
  return (
    <div
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
      onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      style={{ position: 'relative', height: 348, touchAction: 'pan-y', margin: '0 -16px' }}>
      {items.map((src, i) => {
        const r = rel(i);
        if (Math.abs(r) > 2) return null;
        const dragging = dx !== 0;
        return (
          <div key={i}
            onClick={() => { if (movedRef.current) return; if (r !== 0) setCur(i); }}
            style={{
              position: 'absolute', left: '50%', top: 8, width: 172, height: 306,
              transform: `translateX(calc(-50% + ${r * 118}px + ${dx * .55}px)) scale(${r === 0 ? 1 : .84})`,
              zIndex: 10 - Math.abs(r),
              opacity: Math.abs(r) === 2 ? 0 : (r === 0 ? 1 : .55),
              transition: dragging ? 'none' : 'transform 520ms cubic-bezier(.22,.9,.35,1), opacity 420ms ease',
              cursor: 'pointer', willChange: 'transform',
            }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: r === 0 ? '0 18px 36px -14px rgba(227,36,89,.45)' : '0 10px 22px -14px rgba(77,18,46,.4)' }}>
              <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VenueOriginal({ venue, onBack, onMenu, onBook, onHome, onProfile, onMap }) {
  const v = venue || {};
  const photos = v.photos || [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70&auto=format&fit=crop',
  ];
  const dishes = v.dishes || [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=70&auto=format&fit=crop',
  ];
  const [faqOpen, setFaqOpen] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreClosing, setMoreClosing] = useState(false);
  function closeMore() { setMoreClosing(true); }
  function onMoreAnimEnd() { if (moreClosing) { setMoreOpen(false); setMoreClosing(false); } }
  const [saved, setSaved] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [heroExpanded, setHeroExpanded] = useState(false);
  const HERO_SHORT = 220;
  const HERO_TALL  = 370;
  const dragStart = useRef(null);
  const autoTimer = useRef(null);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);

  const resetAutoTimer = () => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => setPhotoIdx(i => (i + 1) % photos.length), 8000);
  };

  useEffect(() => {
    resetAutoTimer();
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y > lastScrollY.current + 8)  setHeroExpanded(false); // scorre giù → chiude
      if (y < lastScrollY.current - 8 && y < 30) setHeroExpanded(true);  // torna in cima → apre
      lastScrollY.current = y;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const onDragStart = (x, y) => { dragStart.current = { x, y }; };
  const onDragEnd = (x, y) => {
    if (!dragStart.current) return;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    dragStart.current = null;
    // click (nessun drag) → toggle espandi/collassa
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      setHeroExpanded(e => !e);
      return;
    }
    if (Math.abs(dy) > Math.abs(dx)) {
      // swipe verticale → espandi / collassa
      if (dy > 40) setHeroExpanded(true);
      if (dy < -40) setHeroExpanded(false);
    } else {
      // swipe orizzontale → cambia foto
      if (Math.abs(dx) < 40) return;
      if (dx < 0) setPhotoIdx(i => Math.min(i + 1, photos.length - 1));
      else        setPhotoIdx(i => Math.max(i - 1, 0));
      resetAutoTimer();
    }
  };
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reportReason, setReportReason] = useState(null);
  const [reportSent, setReportSent] = useState(false);
  const faqs = [
    { q: 'Siete aperti il sabato?', a: 'Sì, dalle 12:00 alle 23:00 con orario continuato.' },
    { q: 'Avete opzioni vegane?', a: 'Certo, almeno 5 piatti vegani sono sempre disponibili.' },
    { q: 'Posso prenotare per gruppi?', a: 'Sì, fino a 30 persone con preavviso di 24 ore.' },
  ];
  const reviews = [
    { name: 'Giulia M.', initial: 'G', rating: 5, when: '2 giorni fa', text: 'Atmosfera incredibile e cucina autentica. La cacio e pepe è la migliore di Roma.', dish: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop' },
    { name: 'Marco R.', initial: 'M', rating: 5, when: '1 settimana fa', text: 'Servizio impeccabile, vino consigliato dal cameriere perfetto.', dish: 'https://images.unsplash.com/photo-1572715376701-98568319fd0b?w=400&q=70&auto=format&fit=crop' },
    { name: 'Sara D.', initial: 'S', rating: 4, when: '2 settimane fa', text: 'Ottima esperienza, tornerò sicuramente con amici.', dish: null },
  ];
  const reportReasons = [
    'Cibo o ambiente non sicuri',
    'Comportamento del personale',
    'Truffa o prezzi scorretti',
    'Discriminazione',
    'Foto o info ingannevoli',
    'Altro motivo',
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: BG_X, position: 'relative',
      fontFamily: "'Hanken Grotesk', -apple-system, 'SF Pro Text', system-ui, sans-serif",
      color: TEXT_X, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Floating top buttons (sticky over scroll) */}
      <div style={{
        position: 'absolute', top: 50, left: 16, right: 16, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 999,
          background: (__BYUP_DK_X ? 'rgba(48,45,52,0.92)' : 'rgba(255,255,255,0.95)'), border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button onClick={() => setSaved(s => !s)} style={{
            width: 38, height: 38, borderRadius: 999,
            background: saved ? PINK_X : (__BYUP_DK_X ? 'rgba(48,45,52,0.92)' : 'rgba(255,255,255,0.95)'), border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            transition: 'background 0.18s',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#fff' : 'none'} stroke={saved ? '#fff' : TEXT_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61 a 5.5 5.5 0 0 0 -7.78 0 L 12 5.67 l -1.06 -1.06 a 5.5 5.5 0 0 0 -7.78 7.78 l 1.06 1.06 L 12 21.23 l 7.78 -7.78 1.06 -1.06 a 5.5 5.5 0 0 0 0 -7.78 z"/></svg>
          </button>
          <button onClick={() => moreOpen ? closeMore() : setMoreOpen(true)} style={{
            width: 38, height: 38, borderRadius: 999,
            background: (__BYUP_DK_X ? 'rgba(48,45,52,0.92)' : 'rgba(255,255,255,0.95)'), border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={TEXT_X}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 100 }}>
        {/* Hero — swipeable gallery */}
        <div
          style={{
            position: 'relative',
            height: heroExpanded ? HERO_TALL : HERO_SHORT,
            background: '#222', cursor: 'grab', userSelect: 'none',
            transition: 'height 0.38s cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseDown={e => onDragStart(e.clientX, e.clientY)}
          onMouseUp={e => onDragEnd(e.clientX, e.clientY)}
          onMouseLeave={() => { dragStart.current = null; }}
          onTouchStart={e => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
        >
          {/* Sliding strip */}
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
          }}>
          <div style={{
            display: 'flex', height: '100%',
            transform: `translateX(-${photoIdx * 100}%)`,
            transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0,
                pointerEvents: 'none',
                animation: i === photoIdx ? 'bkKenBurns 11s ease-in-out infinite alternate' : 'none',
              }}/>
            ))}
          </div>
          </div>
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.72) 100%)',
            pointerEvents: 'none',
          }}/>
          {/* Title */}
          <div style={{ position: 'absolute', left: 20, right: 96, bottom: 44, color: '#fff', pointerEvents: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85, textTransform: 'uppercase', marginBottom: 5 }}>
              Cucina Romana
            </div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 30, fontWeight: 600, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}>
              {v.name || 'Ristorante Cacio e Pepe'}
            </div>
          </div>
          {/* Expand hint */}
          {!heroExpanded && (
            <div style={{
              position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                <path d="M2 2l7 6 7-6" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {/* Dot indicators */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5, pointerEvents: 'none',
          }}>
            {photos.map((_, i) => (
              <div key={i} style={{
                width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 99,
                background: SURF_X, opacity: i === photoIdx ? 1 : 0.45,
                transition: 'width 0.25s, opacity 0.25s',
              }}/>
            ))}
          </div>
          {/* Logo — straddles hero bottom edge */}
          <div style={{
            position: 'absolute', right: 20, bottom: -40, zIndex: 5,
            width: 80, height: 80, borderRadius: 999,
            background: SURF_X, boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '3px solid rgba(255,255,255,0.95)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: 999,
              background: __BYUP_DK_X ? 'linear-gradient(135deg, #4a2230 0%, #5e2838 100%)' : 'linear-gradient(135deg, #FFD3DC 0%, #FFB0C0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: PINK_X, fontFamily: 'Georgia, serif',
            }}>CP</div>
          </div>
        </div>

        {/* Status badges row */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 20px 0 20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: '#0a8a3a', background: __BYUP_DK_X ? 'rgba(20,130,64,.20)' : '#e6f5e9',
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>APERTO</span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: TEXT_X, background: TINT_X,
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>🏆 TOP 10 ROMA</span>
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          {/* Address + hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10 c 0 7 -9 13 -9 13 s -9 -6 -9 -13 a 9 9 0 0 1 18 0 z"/><circle cx="12" cy="10" r="3"/></svg>
              Via dei Gracchi 56, 00187 Roma
            </div>
            <div style={{ fontSize: 13.5, color: MUTED_X, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Lun – Ven · 11:00 – 23:00
            </div>
          </div>

          {/* Recensione media */}
          <div style={{ marginTop: 18, marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 10 }}>
              Recensione media
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[1,2,3,4,5].map(n => {
                const filled = n <= Math.round(4.8);
                return (
                  <div key={n} style={{
                    width: 30, height: 30, borderRadius: 7,
                    background: filled ? PINK_X : TINT_X,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                );
              })}
              <div style={{ marginLeft: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: TEXT_X, letterSpacing: -0.5 }}>4.8</span>
                <span style={{ fontSize: 14, color: MUTED_X, fontWeight: 500 }}>· 320 recensioni</span>
              </div>
            </div>
          </div>

          {/* Promo / Eventi */}
          <Section title="Promo / Eventi">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <PromoTag info="Ogni giorno · 18:00 – 21:00">Aperitivo 2x1</PromoTag>
              <PromoTag info="Tutti i venerdì · dalle 21:00">Karaoke venerdì</PromoTag>
              <PromoTag info="Ogni domenica · 11:00 – 15:00">Brunch domenica</PromoTag>
            </div>
          </Section>

          {/* Premi */}
          <Section title="Premi e riconoscimenti">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <AwardTag tier="gold">Top 10 Roma 2025</AwardTag>
              <AwardTag tier="silver">Gambero Rosso</AwardTag>
              <AwardTag tier="bronze">Tripadvisor Excellence</AwardTag>
            </div>
          </Section>

          {/* Bio */}
          <Section title="La nostra storia">
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: TEXT_X }}>
              {bioExpanded
                ? <>Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno. Pasta tirata a mano ogni mattina, materie prime dai mercati di Testaccio e Campagna Amica. Carta dei vini con 200 etichette del Lazio. Una stella Michelin nel 2022. {' '}<span onClick={() => setBioExpanded(false)} style={{ color: PINK_X, fontWeight: 600, cursor: 'pointer' }}>Meno ↑</span></>
                : <>Benvenuto al Ristorante Paradiso! Offriamo un'esperienza culinaria unica con piatti tradizionali della cucina romana, ingredienti freschi e selezionati ogni giorno.{' '}<span onClick={() => setBioExpanded(true)} style={{ color: PINK_X, fontWeight: 600, cursor: 'pointer' }}>...Altro</span></>
              }
            </div>
          </Section>

          {/* Piatti in evidenza — tap: apre il menu già scrollato sul piatto */}
          <Section title="I più ordinati">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {dishes.slice(0, 3).map((p, i) => {
                const names = ['Cacio e Pepe', 'Carbonara', 'Amatriciana'];
                return (
                  <div key={i} className="bk-press"
                    onClick={() => {
                      try { sessionStorage.setItem('byup_menu_dish', names[i]); } catch (e) {}
                      onMenu && onMenu();
                    }}
                    style={{
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    background: SURF_X, boxShadow: '0 8px 20px -14px rgba(77,18,46,.4)',
                    border: '1px solid rgba(77,18,46,.06)',
                  }}>
                    <div style={{ height: 88, overflow: 'hidden' }}>
                      <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_X, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{names[i]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Reel dalla cucina — stack 9:16 con play */}
          <Section title="Dalla cucina">
            <ReelStack items={[1, 2, 3, 4].map(n => 'assets/reels/reel-' + n + '.webp')}/>
          </Section>

          {/* Recensioni */}
          <Section title="Cosa dicono di noi">
            <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 238, overflow: 'hidden' }}>
              {reviews.slice(0, 2).map((r, i) => (
                <div key={i} style={{
                  padding: '13px 14px', borderRadius: 14,
                  background: BG_X,
                  display: 'flex', flexDirection: 'column', gap: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 999, background: PINK_X, flexShrink: 0,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13,
                    }}>{r.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT_X }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: MUTED_X }}>{r.when}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= r.rating ? PINK_X : '#e0d8db'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: TEXT_X }}>{r.text}</div>
                </div>
              ))}
            </div>
            {/* fade blur sulla seconda recensione + CTA solo testo */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 120,
              background: __BYUP_DK_X ? 'linear-gradient(180deg, rgba(22,21,20,0) 0%, rgba(22,21,20,.92) 70%, #161514 100%)' : 'linear-gradient(180deg, rgba(251,244,241,0) 0%, rgba(251,244,241,.92) 70%, #FBF4F1 100%)',
              backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 2,
            }}>
              <button onClick={() => setReviewsOpen(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: PINK_X, fontSize: 14, fontWeight: 700, padding: '10px 16px',
              }}>Leggi tutte le recensioni ↓</button>
            </div>
            </div>
          </Section>

          {/* Mappa */}
          <Section title="Dove siamo">
            <div style={{ height: 160, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
              <VenueMapThumbnail lat={v.lat || 41.9065} lng={v.lng || 12.4642}/>
              <button onClick={onMap} style={{
                position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
                background: SURF_X, border: 'none', borderRadius: 999,
                padding: '8px 16px', fontSize: 12.5, fontWeight: 700, color: TEXT_X,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}>Vedi mappa →</button>
            </div>
          </Section>

          {/* Altre info */}
          <Section title="Altre info">
            <div style={{ background: BG_X, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow icon="P" label="Parcheggio custodito Via Giulia"/>
              <InfoRow icon="M" label="Metro Tiburtina linea B · Bus 54, 60, 12, 40"/>
            </div>
          </Section>

          {/* Altre sedi */}
          <Section title="Altre sedi">
            <SedeRow city="Milano" addr="Corso Venezia 50"/>
            <div style={{ height: 8 }}/>
            <SedeRow city="Firenze" addr="Via dei Calzaiuoli 12"/>
          </Section>

          {/* FAQ */}
          <Section title="Domande frequenti">
            {faqs.map((f, i) => (
              <div key={i} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} style={{
                borderBottom: `1px solid ${BORDER_X}`, padding: '12px 0', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: TEXT_X }}>{f.q}</span>
                  <span style={{ color: MUTED_X, transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>⌄</span>
                </div>
                {faqOpen === i && <div style={{ fontSize: 13, color: MUTED_X, marginTop: 8, lineHeight: 1.5 }}>{f.a}</div>}
              </div>
            ))}
          </Section>

          {/* Galleria */}
          <Section title="Galleria fotografica">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ gridRow: 'span 2', borderRadius: 12, overflow: 'hidden', height: 200 }}>
                <img src={photos[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 96 }}>
                <img src={photos[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 96 }}>
                <img src={photos[3]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            </div>
          </Section>

          {/* Social */}
          <Section title="Canali Social">
            <div style={{ display: 'flex', gap: 12 }}>
              <SocialDot label="f"/>
              <SocialDot label="ig"/>
              <SocialDot label="yt"/>
            </div>
          </Section>
        </div>
      </div>

      {/* More menu (kebab) */}
      {moreOpen && (
        <>
          <style>{`
            @keyframes moreSheetUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
            @keyframes moreSheetDown { from { transform: translateY(0); }    to { transform: translateY(100%); } }
            @keyframes moreBackIn    { from { opacity: 0; } to { opacity: 1; } }
            @keyframes moreBackOut   { from { opacity: 1; } to { opacity: 0; } }
          `}</style>
          <div onClick={closeMore} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100,
            animation: moreClosing ? 'moreBackOut 0.25s ease forwards' : 'moreBackIn 0.22s ease',
          }}/>
          <div onClick={(e) => e.stopPropagation()} onAnimationEnd={onMoreAnimEnd} style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: SURF_X, borderRadius: '20px 20px 0 0',
            padding: '8px 0 34px', zIndex: 1101,
            animation: moreClosing
              ? 'moreSheetDown 0.28s cubic-bezier(0.32,0.72,0,1) forwards'
              : 'moreSheetUp 0.30s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{ width: 40, height: 4, background: MUTESURF_X, borderRadius: 999, margin: '8px auto 16px' }}/>
            <MoreRow label="Condividi" icon="↗"/>
            <div style={{ height: 1, background: BORDER_X, margin: '6px 20px' }}/>
            <MoreRow label="Segnala questo locale" icon="⚠" danger
              onClick={() => { closeMore(); setReportOpen(true); setReportSent(false); setReportReason(null); }}/>
          </div>
        </>
      )}

      {/* Report sheet */}
      {reviewsOpen && (
        <>
          <div onClick={() => setReviewsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(28,6,16,0.5)', zIndex: 80, animation: 'fade .2s ease' }}/>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 81,
            background: BG_X, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            maxHeight: '82%', display: 'flex', flexDirection: 'column',
            animation: 'slideUp .32s cubic-bezier(.2,.8,.2,1)',
          }}>
            <div style={{ width: 40, height: 4, background: 'rgba(77,18,46,.2)', borderRadius: 2, margin: '10px auto 6px', flexShrink: 0 }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 10px', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 19, fontWeight: 600, color: TEXT_X }}>Tutte le recensioni</div>
              <button onClick={() => setReviewsOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, fontWeight: 700, color: TEXT_X, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 18px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...reviews, ...reviews].map((r, i) => (
                <div key={i} style={{ padding: '13px 14px', borderRadius: 16, background: SURF_X, border: '1px solid rgba(77,18,46,.07)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 999, background: PINK_X, flexShrink: 0, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{r.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT_X }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: MUTED_X }}>{r.when}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                        {[1,2,3,4,5].map(st => (
                          <svg key={st} width="11" height="11" viewBox="0 0 24 24" fill={st <= r.rating ? PINK_X : '#e0d8db'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: TEXT_X }}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {reportOpen && (
        <div onClick={() => setReportOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: SURF_X, borderRadius: '20px 20px 0 0',
            padding: '8px 20px 30px', maxHeight: '80%', overflowY: 'auto',
          }}>
            <div style={{ width: 40, height: 4, background: MUTESURF_X, borderRadius: 999, margin: '8px auto 16px' }}/>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Segnalazione inviata</div>
                <div style={{ fontSize: 13.5, color: MUTED_X, lineHeight: 1.5, marginBottom: 20 }}>
                  Il team byup la esaminerà entro 48 ore. Ti aggiorneremo via email.
                </div>
                <button onClick={() => setReportOpen(false)} style={{
                  width: '100%', height: 50, background: TEXT_X, color: '#fff',
                  border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Chiudi</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Segnala questo locale</div>
                <div style={{ fontSize: 13, color: MUTED_X, lineHeight: 1.5, marginBottom: 16 }}>
                  Aiutaci a mantenere byup sicuro. Le tue segnalazioni sono anonime per il locale e revisionate dal nostro team.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {reportReasons.map(r => (
                    <button key={r} onClick={() => setReportReason(r)} style={{
                      textAlign: 'left', padding: '14px 16px', borderRadius: 12,
                      border: `1.5px solid ${reportReason === r ? PINK_X : BORDER_X}`,
                      background: reportReason === r ? CORALSURF_X : SURF_X,
                      fontSize: 14, color: TEXT_X, fontWeight: reportReason === r ? 600 : 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{r}</span>
                      {reportReason === r && <span style={{ color: PINK_X, fontWeight: 700 }}>✓</span>}
                    </button>
                  ))}
                </div>
                <textarea placeholder="Vuoi aggiungere dettagli? (opzionale)" style={{
                  width: '100%', minHeight: 80, padding: 12, borderRadius: 12,
                  border: `1px solid ${BORDER_X}`, fontSize: 13.5, fontFamily: 'inherit',
                  resize: 'none', marginBottom: 16, boxSizing: 'border-box',
                }}/>
                <button disabled={!reportReason} onClick={() => setReportSent(true)} style={{
                  width: '100%', height: 50,
                  background: reportReason ? PINK_X : '#f0e8ea',
                  color: reportReason ? '#fff' : MUTED_X,
                  border: 'none', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: reportReason ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                }}>Invia segnalazione</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sticky CTA — sits above tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        opacity: moreOpen ? 0 : 1, pointerEvents: moreOpen ? 'none' : 'auto',
        transition: 'opacity 0.2s',
        padding: '16px 16px 32px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        display: 'flex', gap: 12, zIndex: 1000,
      }}>
        <button onClick={onBook} style={{
          flex: 1, height: 58, background: SURF_X, color: TEXT_X,
          border: `1.5px solid ${BORDER_X}`, borderRadius: 999, fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Prenota</button>
        <button onClick={onMenu} style={{
          flex: 1, height: 58, background: PINK_X, color: '#fff',
          border: 'none', borderRadius: 999, fontSize: 17, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(227,36,89,0.3)',
        }}>Menù</button>
      </div>

    </div>
  );
}

function MoreRow({ label, icon, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 22px', background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left',
      color: danger ? '#c44' : TEXT_X, fontSize: 14.5, fontWeight: 500,
    }}>
      <span style={{ fontSize: 18, width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_X, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function PromoTag({ children, info }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <span onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: open ? PINK_X : TINT_X,
        color: open ? '#fff' : TEXT_X,
        padding: '6px 14px', borderRadius: 999,
        fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
        cursor: 'pointer', transition: 'all 0.15s',
        userSelect: 'none',
      }}>
        {children}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {open && info && (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: SURF_X, border: `1px solid ${BORDER_X}`,
          borderRadius: 12, padding: '6px 12px',
          fontSize: 12, color: MUTED_X, fontWeight: 500,
          whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        }}>{info}</span>
      )}
    </div>
  );
}
// Premi: outline minimal con icona alloro
function AwardTag({ children, tier = 'gold' }) {
  const TIERS = {
    gold:   { c: '#c9930a', bg: __BYUP_DK_X ? '#2f2820' : '#fdf6e0', bd: '#efd98a' },
    silver: { c: '#7b8494', bg: __BYUP_DK_X ? '#262a30' : '#f3f5f8', bd: '#ccd3dd' },
    bronze: { c: '#a3652f', bg: __BYUP_DK_X ? '#2e2620' : '#f9ede1', bd: '#e2c3a2' },
  };
  const t = TIERS[tier] || TIERS.gold;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.bg, color: TEXT_X, padding: '6px 12px 6px 10px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
      border: `1px solid ${t.bd}`,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill={t.c} stroke={t.c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9 a 6 6 0 0 0 12 0 V3 H6 z" />
        <path d="M12 15 v 4 M8.5 21 h 7" fill="none"/>
        <path d="M6 5H3.5a4.5 4.5 0 0 0 4 4.4M18 5h2.5a4.5 4.5 0 0 1-4 4.4" fill="none"/>
      </svg>
      {children}
    </span>
  );
}
function InfoRow({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: SURF_X, border: `1px solid ${BORDER_X}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: TEXT_X }}>{icon}</div>
      <div style={{ fontSize: 13, color: TEXT_X, flex: 1 }}>{label}</div>
    </div>
  );
}
function SedeRow({ city, addr }) {
  return (
    <div style={{ background: BG_X, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 13, background: CORALSURF_X, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.4 5 5.2A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.2l1 5.2"/>
          <path d="M4 10.4a2.6 2.6 0 0 0 5.2 0 2.6 2.6 0 0 0 5.3 0 2.6 2.6 0 0 0 5.3 0"/>
          <path d="M5.3 12.8V19a1.5 1.5 0 0 0 1.5 1.5h10.4A1.5 1.5 0 0 0 18.7 19v-6.2"/>
          <path d="M9.8 20.3v-4.6a1.3 1.3 0 0 1 1.3-1.3h1.8a1.3 1.3 0 0 1 1.3 1.3v4.6"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{city}</div>
        <div style={{ fontSize: 12.5, color: MUTED_X }}>{addr}</div>
      </div>
    </div>
  );
}
function SocialDot({ label }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 999, background: PINK_X, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, fontFamily: 'serif',
    }}>{label}</div>
  );
}

Object.assign(window, { ProfileScreen, VenueScreen, BookingSheet });

// ─── ConsensiPanel — i consensi del registro in un posto solo ───────────────
// A3 e A18 nascono nella sezione allergeni, A6 alla registrazione: qui si
// RIVEDONO e si cambiano. Un consenso mai incontrato (nessuno stato nel
// registro) NON compare: il pannello mostra solo ciò che esiste per questo
// utente. `dove` dice in che punto dell'app il consenso è nato. Spegnere
// A3 cancella anche le preferenze salvate (senza consenso, niente dato).
const CONSENSI_DEF = [
  { id: 'A3',  label: 'Preferenze alimentari e allergeni',  desc: 'Filtrare i menù in base a diete e allergie', dove: 'impostando le preferenze alimentari' },
  { id: 'A18', label: 'Offerte sulle preferenze',            desc: 'Promozioni costruite su diete e allergeni',  dove: 'impostando le preferenze alimentari' },
  // A6 copre anche le promo su misura sullo storico ordini (PROMOP assorbito
  // il 2026-08-06): un solo consenso marketing, dichiarato già nella card di
  // registrazione. Le offerte su dati alimentari restano A18 (art. 9).
  { id: 'A6',  label: 'Marketing byup',                      desc: 'Novità e offerte, anche su misura sui tuoi ordini, via email e notifica', dove: 'alla registrazione' },
  // Opt-out, non consenso: legittimo interesse, attivo salvo disattivazione.
  { id: 'SUGG', label: 'Suggerimenti personalizzati',        desc: 'Consigli basati sui tuoi gusti e ordini · attivo, puoi disattivarlo', optout: true },
];

function ConsensiPanel({ onOpenPrivacy, sep }) {
  // Chiuso di default: i consensi sono un cassetto, non la prima cosa da
  // leggere ogni volta. La testata riassume (quanti attivi) e apre.
  const [aperto, setAperto] = useState(false);
  const [, forza] = useState(0);
  const cambia = (id, v) => {
    ByupConsensi.set(id, v);
    if (id === 'A3' && !v) {
      // niente base giuridica, niente dato
      try { localStorage.setItem('byup_allergens', JSON.stringify({ allergens: {}, diets: {} })); } catch (e) {}
      if (ByupConsensi.stato('A18') && ByupConsensi.stato('A18').ok) ByupConsensi.set('A18', false);
    }
    forza(x => x + 1);
  };
  const quando = (st) => {
    if (!st) return null;
    const d = new Date(st.quando);
    return `${d.toLocaleDateString('it-IT')}`;
  };
  // Il conteggio in testata conta solo i CONSENSI dati, non l'opt-out
  // (che è attivo di default e non è un consenso).
  const attivi = CONSENSI_DEF.filter(c => { if (c.optout) return false; const st = ByupConsensi.stato(c.id); return st && st.ok; }).length;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ background: SURF_X, borderRadius: 14, overflow: 'hidden', border: `1px solid ${__BYUP_DK_X ? 'rgba(255,255,255,0.07)' : '#F0EAEC'}` }}>
        <button onClick={() => setAperto(a => !a)} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '13px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          ...(aperto ? sep : {}),
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, color: TEXT_X, fontWeight: 600 }}>Privacy e consensi</div>
            <div style={{ fontSize: 11.5, color: MUTED_X, marginTop: 1 }}>
              {attivi === 0 ? 'Nessun consenso attivo' : `${attivi} ${attivi === 1 ? 'consenso attivo' : 'consensi attivi'}`}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: aperto ? 'rotate(180deg)' : 'none', transition: 'transform .18s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {aperto && CONSENSI_DEF.map((c, i) => {
          const st = ByupConsensi.stato(c.id);
          // Mai incontrato = niente riga: il pannello riflette solo i consensi
          // che esistono per questo utente (l'opt-out SUGG è sempre vivo).
          if (!st && !c.optout) return null;
          const data = quando(st);
          // Opt-out (SUGG): stato assente = ATTIVO — legittimo interesse.
          const acceso = c.optout ? (st ? st.ok : true) : !!(st && st.ok);
          return (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', ...sep,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, color: TEXT_X }}>{c.label}</div>
                <div style={{ fontSize: 11.5, color: MUTED_X, marginTop: 2, lineHeight: 1.4 }}>{c.desc}</div>
                {!c.optout && data && (
                  <div style={{ fontSize: 11, color: MUTED_X, marginTop: 2, opacity: .8 }}>
                    {st.ok ? `Dato ${c.dove} · ${data}` : `Disattivato il ${data}`}
                  </div>
                )}
              </div>
              <ProfileToggle value={acceso} onChange={(v) => cambia(c.id, v)}/>
            </div>
          );
        })}
        {aperto && (
          <div style={{ fontSize: 11.5, color: MUTED_X, lineHeight: 1.5, padding: '10px 14px 13px' }}>
            Per richiedere una copia dei tuoi dati consulta l'<span onClick={onOpenPrivacy} style={{ color: PINK_X, fontWeight: 600, cursor: 'pointer' }}>informativa sulla privacy</span>.
          </div>
        )}
      </div>
    </div>
  );
}
