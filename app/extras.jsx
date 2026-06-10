/* global React, ReactDOM */
// extras.jsx — Profile, Venue, Booking sheet, fancy food icons
const { useState, useEffect, useRef } = React;

// ─── Tokens (mirror app.jsx) ────────────────────────────────
const PINK_X = '#E32459';
const TEXT_X = '#1F1A1B';
const MUTED_X = '#7A7176';
const BG_X = '#F5F5F5';
const BORDER_X = '#EAE6E7';

// ─── Profile screen ─────────────────────────────────────────
const PROFILE_ALLERGENS = [
  { id: 'glutine',     label: 'Glutine',       hint: 'Pane, pasta, dolci',    emoji: '🌾' },
  { id: 'lattosio',    label: 'Lattosio',      hint: 'Latte, formaggi, burro', emoji: '🥛' },
  { id: 'noci',        label: 'Frutta a guscio', hint: 'Noci, nocciole, mandorle', emoji: '🥜' },
  { id: 'uova',        label: 'Uova',          hint: 'Frittate, dolci, salse', emoji: '🥚' },
  { id: 'crostacei',   label: 'Crostacei',     hint: 'Gamberi, scampi, granchio', emoji: '🦐' },
  { id: 'pesce',       label: 'Pesce',         hint: 'Acciughe, salse di pesce', emoji: '🐟' },
  { id: 'soia',        label: 'Soia',          hint: 'Tofu, tempeh, salsa di soia', emoji: '🫘' },
  { id: 'sedano',      label: 'Sedano',        hint: 'Brodi, soffritti', emoji: '🥬' },
];
const PROFILE_DIETS = [
  { id: 'vegetariano',   label: 'Vegetariano',   emoji: '🥗' },
  { id: 'vegano',        label: 'Vegano',        emoji: '🌱' },
  { id: 'senzaglutine',  label: 'Senza glutine', emoji: '🌾' },
  { id: 'halal',         label: 'Halal',         emoji: '🌙' },
  { id: 'kosher',        label: 'Kosher',        emoji: '✡️' },
  { id: 'pescetariano',  label: 'Pescetariano',  emoji: '🐟' },
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
        width: 22, height: 22, borderRadius: 999, background: '#fff',
        position: 'absolute', top: 2, left: value ? 20 : 2,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}/>
    </div>
  );
}

function AllergensView({ onBack, prefs, setPrefs }) {
  const toggle = (group, id) => setPrefs(p => ({
    ...p,
    [group]: { ...(p[group] || {}), [id]: !(p[group]?.[id]) },
  }));
  const count = (group) => Object.values(prefs[group] || {}).filter(Boolean).length;

  const SectionHeader = ({ title, badge, description, icon, color, bg }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT_X }}>{title}</div>
        {badge > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: PINK_X, background: '#FCE9EE', padding: '3px 9px', borderRadius: 999 }}>
            {badge} {badge === 1 ? 'attivo' : 'attivi'}
          </div>
        )}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', background: bg, borderRadius: 10,
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
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
              background: on ? '#FCE9EE' : '#F8F5F6',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#F8F5F6', borderRadius: 14, overflow: 'hidden' }}>
        {PROFILE_ALLERGENS.map((a, i) => {
          const on = !!prefs.allergens?.[a.id];
          return (
            <div key={a.id} onClick={() => toggle('allergens', a.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 14px',
              background: on ? '#FFF5F5' : '#fff',
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
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
            <div key={o.id} style={{ background: '#F8F5F6', borderRadius: 18, overflow: 'hidden' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
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
                      background: '#F8F5F6',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: MUTED_X }}>Totale</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: TEXT_X }}>€ {o.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <button style={{
                      padding: '9px 24px', background: '#fff',
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
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#F8F5F6', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            {others.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                borderBottom: i < others.length - 1 ? '1px solid #EDE8EA' : 'none',
                background: '#fff',
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
                  background: '#FCE9EE', border: 'none', borderRadius: 999,
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
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 20px 34px', zIndex: 21,
            animation: 'confirmUp 0.28s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{ width: 40, height: 4, background: '#E0DADC', borderRadius: 999, margin: '8px auto 20px' }}/>
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
                border: '1.5px solid #E0DADC', background: '#fff',
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
          border: `1.5px dashed ${PINK_X}`, background: '#FCE9EE',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600, color: PINK_X,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Aggiungi metodo di pagamento
        </button>
      ) : (
        <div style={{ background: '#F8F5F6', borderRadius: 16, padding: '16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_X, marginBottom: 14 }}>Nuova carta</div>
          {[
            { label: 'Numero carta', value: newNum, set: setNewNum, placeholder: '•••• •••• •••• ••••' },
            { label: 'Scadenza', value: newExp, set: setNewExp, placeholder: 'MM/AA' },
            { label: 'CVV', value: newCvv, set: setNewCvv, placeholder: '•••' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{f.label}</div>
              <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                style={{ width: '100%', padding: '11px 12px', background: '#fff', border: '1.5px solid transparent', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = PINK_X}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setAddOpen(false)} style={{
              flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E0DADC',
              background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: MUTED_X,
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
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Preferiti</div>
        {items.length > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: PINK_X, background: '#FCE9EE', padding: '4px 12px', borderRadius: 999 }}>{items.length}</span>}
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
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8F5F6', borderRadius: 18, padding: '12px 14px', cursor: onOpenVenue ? 'pointer' : 'default' }}>
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
                background: '#FCE9EE', border: 'none', cursor: 'pointer',
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
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
          background: '#F8F5F6', border: `1.5px solid ${testo ? PINK_X : 'transparent'}`,
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

function MieiDatiView({ onBack }) {
  const [nome, setNome] = useState('Mario');
  const [cognome, setCognome] = useState('Rossi');
  const [genere, setGenere] = useState('Uomo');
  const [nascita, setNascita] = useState('15/04/1990');
  const [saved, setSaved] = useState(false);

  function salva() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const Field = ({ label, value, onChange, type = 'text' }) => (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 2 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '13px 14px',
          background: '#F8F5F6', border: '1.5px solid transparent',
          borderRadius: 12, fontSize: 15, color: TEXT_X,
          fontFamily: 'inherit', outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = PINK_X}
        onBlur={e => e.target.style.borderColor = 'transparent'}
      />
    </div>
  );

  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', marginBottom: 22,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>I miei dati</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nome" value={nome} onChange={setNome}/>
        <Field label="Cognome" value={cognome} onChange={setCognome}/>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_X, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 2 }}>Genere</div>
          <div style={{ background: '#F8F5F6', borderRadius: 12, overflow: 'hidden' }}>
            {['Uomo', 'Donna', 'Non binario', 'Preferisco non specificare'].map((g, i, arr) => (
              <button key={g} onClick={() => setGenere(g)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '13px 14px', background: 'transparent',
                border: 'none', borderBottom: i < arr.length - 1 ? '1px solid #EDE8EA' : 'none',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <span style={{ fontSize: 14.5, color: genere === g ? PINK_X : TEXT_X, fontWeight: genere === g ? 600 : 400 }}>{g}</span>
                <div style={{
                  width: 20, height: 20, borderRadius: 999,
                  border: `2px solid ${genere === g ? PINK_X : '#C8C0C3'}`,
                  background: genere === g ? PINK_X : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', flexShrink: 0,
                }}>
                  {genere === g && <div style={{ width: 7, height: 7, borderRadius: 999, background: '#fff' }}/>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Field label="Data di nascita" value={nascita} onChange={setNascita} type="text"/>
      </div>

      <button onClick={salva} style={{
        width: '100%', marginTop: 32, padding: '15px',
        background: saved ? '#30D158' : PINK_X,
        border: 'none', borderRadius: 14,
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 15, fontWeight: 700, color: '#fff',
        transition: 'background 0.3s',
      }}>
        {saved ? 'Salvato ✓' : 'Salva modifiche'}
      </button>
    </div>
  );
}

function AccountFormView({ title, subtitle, fields, submitLabel, successMsg, onBack }) {
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
        width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
                background: f.readOnly ? '#F0EEF0' : '#F8F5F6',
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
    </div>
  );
}

function LegalView({ title, content, onBack }) {
  return (
    <div style={{ animation: 'fade 0.2s ease' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 999, background: '#fff',
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
        <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={iconColor || MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div style={{ background: '#F8F5F6', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {items.map((child, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: '#f3eef0', marginLeft: 58 }}/>}
            {child}
          </React.Fragment>
        ))}
      </div>
    );
  };
  const QuickCard = ({ label, iconSvg, iconColor, onClick, large, badge }) => (
    <button onClick={onClick} style={{
      background: '#FCE9EE', borderRadius: 18,
      padding: large ? '22px 14px 18px' : '16px 8px 14px',
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
      position: 'relative',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: 11, fontWeight: 700, color: PINK_X,
          background: 'rgba(255,255,255,0.8)', padding: '2px 7px', borderRadius: 999,
        }}>{badge}</div>
      )}
      <svg width={large ? 26 : 22} height={large ? 26 : 22} viewBox="0 0 24 24" fill="none"
        stroke={iconColor || PINK_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ marginBottom: large ? 28 : 6 }}>
        {iconSvg}
      </svg>
      <span style={{ fontSize: large ? 15 : 15, color: TEXT_X, fontWeight: 600, textAlign: 'left' }}>{label}</span>
    </button>
  );

  const activeAllergenCount =
    Object.values(allergenPrefs.allergens || {}).filter(Boolean).length +
    Object.values(allergenPrefs.diets || {}).filter(Boolean).length;

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      color: TEXT_X, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <style>{`@keyframes profileSlideIn { from { transform: translateX(18px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <div style={{ flex: 1, overflowY: 'auto', padding: '60px 18px 120px' }}>
        {view === 'main' && (
          <div style={{ animation: 'fade 0.2s ease' }}>

            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginBottom: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            {/* Avatar centrato */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, paddingBottom: 28 }}>
              {/* Anello rosa byup */}
              <div style={{ background: PINK_X, borderRadius: 999, padding: 3, marginBottom: 14, boxShadow: '0 4px 20px rgba(227,36,89,0.25)' }}>
                <div style={{ width: 90, height: 90, borderRadius: 999, overflow: 'hidden', border: '2.5px solid #fff' }}>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&fit=facearea&facepad=2.5"
                    alt=""
                    style={{ display: 'block', width: 90, height: 90, objectFit: 'cover', objectPosition: 'center top' }}
                  />
                </div>
              </div>
              {/* Nome + rotellina */}
              <button onClick={() => setView('account')} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: TEXT_X }}>Mario Rossi</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <div style={{ fontSize: 13, color: MUTED_X, marginTop: 4 }}>mario.rossi@email.it</div>
            </div>

            {/* Quick actions 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              <QuickCard label="Storico ordini" onClick={() => setView('orders')}
                bg="#FCE9EE" iconColor="#E32459" large
                iconSvg={<><polyline points="12 8 12 12 14 14"/><circle cx="12" cy="12" r="9"/></>}/>
              <QuickCard label="Dieta & allergeni" onClick={() => setView('allergens')}
                bg="#FEF0E3" iconColor="#C85C1A" large
                iconSvg={<><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
              <QuickCard label="Preferiti" onClick={() => setView('preferiti')}
                bg="#F9E3EE" iconColor="#B01E46" large
                iconSvg={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>}/>
              <QuickCard label="Pagamenti" onClick={() => setView('pagamenti')}
                bg="#FEF7E3" iconColor="#A07010" large
                iconSvg={<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>}/>
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
            </RowGroup>

            <div style={{ height: 14 }}/>

            <RowGroup>
              <Row label="Segnala un problema" onClick={() => setView('segnala')}
                iconBg="#FCE9EE" iconColor={PINK_X}
                iconSvg={<><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
            </RowGroup>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button onClick={() => setConfirmLogout(true)} style={{
                padding: '8px 28px', background: '#EBEBEB',
                border: '1px solid #000', borderRadius: 999,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, color: '#000',
              }}>Esci</button>
            </div>

          </div>
        )}

        {view === 'account' && (
          <div style={{ animation: 'fade 0.2s ease', position: 'relative' }}>
            <button onClick={() => setView('main')} style={{
              width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
              <Row label="Recupera password" onClick={() => setView('recupera-password')}
                iconColor={PINK_X}
                iconSvg={<><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
              <Row label="Modifica email" onClick={() => setView('modifica-email')}
                iconColor={PINK_X}
                iconSvg={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>
            </RowGroup>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button onClick={() => setConfirmDeleteAccount(true)} style={{
                padding: '8px 28px', background: '#EBEBEB',
                border: '1px solid #000', borderRadius: 999,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, color: '#000',
              }}>Elimina account</button>
            </div>

          </div>
        )}

        {view === 'gestione' && (
          <div style={{ animation: 'fade 0.2s ease' }}>
            <button onClick={() => setView('account')} style={{
              width: 36, height: 36, borderRadius: 999, background: '#fff',
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
                padding: '8px 24px', background: '#EBEBEB',
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
          <MieiDatiView onBack={() => setView('main')}/>
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
            { h: 'Titolare del trattamento', p: 'byup S.r.l., con sede legale in Via del Corso 10, 00186 Roma (RM) — C.F. / P.IVA 12345678901 — è il titolare del trattamento dei dati personali raccolti tramite questa applicazione. Contatto DPO: privacy@byup.it' },
            { h: 'Dati raccolti', p: 'Raccogliamo i dati che fornisci durante la registrazione (nome, cognome, e-mail, numero di telefono), i dati di navigazione e utilizzo dell\'app (pagine visitate, preferenze, ricerche), i dati delle prenotazioni e le preferenze alimentari (allergeni, diete) che scegli di inserire volontariamente.' },
            { h: 'Finalità e base giuridica', p: 'I dati sono trattati per: (a) eseguire il contratto di servizio — art. 6.1.b GDPR; (b) adempiere a obblighi legali — art. 6.1.c GDPR; (c) inviarti comunicazioni promozionali solo previo tuo consenso esplicito — art. 6.1.a GDPR.' },
            { h: 'Conservazione', p: 'I dati dell\'account sono conservati per tutta la durata del rapporto contrattuale e per i successivi 10 anni per obblighi fiscali. I dati di navigazione sono conservati per un massimo di 13 mesi.' },
            { h: 'I tuoi diritti', p: 'Hai diritto di accedere, rettificare, cancellare e portare i tuoi dati (artt. 15-20 GDPR). Puoi opporti al trattamento o chiedere la limitazione in qualsiasi momento scrivendo a privacy@byup.it. Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).' },
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
              width: 36, height: 36, borderRadius: 999, background: '#F8F5F6',
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
      {(() => { const B = window.BottomTabBar; return B ? <B active="profile" onHome={onTabHome} onProfile={() => {}} showQR={false}/> : null; })()}

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
            width: '100%', maxWidth: 320, background: '#fff', borderRadius: 22,
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
  const isEdit = !!editBooking;
  const [step, setStep] = useState(0); // 0 form, 1 success
  const [date, setDate] = useState('Sab 4 mag');
  const [time, setTime] = useState(defaultTime || '20:30');
  const [people, setPeople] = useState(2);
  const [name, setName] = useState('Mario Rossi');
  const [phone, setPhone] = useState('+39 333 1234567');
  const [note, setNote] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      if (editBooking) {
        setDate(editBooking.date || date);
        setTime(editBooking.time || time);
        setPeople(editBooking.people || 2);
        setName(editBooking.name || name);
        setPhone(editBooking.phone || phone);
        setNote(editBooking.note || '');
        setPrefilled(false);
      } else if (defaultTime) { setTime(defaultTime); setPrefilled(true); }
      else setPrefilled(false);
    }
  }, [open, defaultTime, editBooking]);
  if (!open) return null;

  const dates = ['Sab 4 mag', 'Dom 5 mag', 'Lun 6 mag', 'Mar 7 mag', 'Mer 8 mag', 'Gio 9 mag', 'Ven 10 mag'];
  const baseTimes = ['12:30','13:00','13:30','19:30','20:00','20:30','21:00','21:30','22:00'];
  const times = !baseTimes.includes(time) ? [...baseTimes, time].sort() : baseTimes;

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxHeight: '88%', background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 0', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: '#e0dcdd', margin: '0 auto 10px' }}/>

        {step === 0 ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{isEdit ? 'Modifica prenotazione' : 'Prenota un tavolo'}</div>
            <div style={{ fontSize: 13, color: MUTED_X, marginBottom: 18 }}>
              {venue?.name || editBooking?.venue || 'Ristorante'}
              {isEdit && ' · cambia data/orario in base alle nuove disponibilità'}
            </div>

            <Field label="Data">
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, margin: '0 -20px', padding: '0 20px 4px' }}>
                {dates.map(d => (
                  <Pill key={d} active={date===d} onClick={() => setDate(d)}>{d}</Pill>
                ))}
              </div>
            </Field>

            <Field label="Orario">
              {prefilled && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#FCE9EE', color: PINK_X,
                  fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                  marginBottom: 8,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PINK_X} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 12 10 18 20 6"/>
                  </svg>
                  Slot scelto dalla home
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {times.map(t => (
                  <Pill key={t} active={time===t} onClick={() => setTime(t)}>{t}</Pill>
                ))}
              </div>
            </Field>

            <Field label="Coperti">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => setPeople(p => Math.max(1, p-1))} style={stepperBtn}>−</button>
                <div style={{ fontSize: 20, fontWeight: 700, minWidth: 50, textAlign: 'center' }}>{people}</div>
                <button onClick={() => setPeople(p => Math.min(20, p+1))} style={stepperBtn}>+</button>
                <span style={{ fontSize: 13, color: MUTED_X, marginLeft: 4 }}>{people === 1 ? 'persona' : 'persone'}</span>
              </div>
            </Field>

            <Field label="Nome">
              <Input value={name} onChange={setName}/>
            </Field>
            <Field label="Telefono">
              <Input value={phone} onChange={setPhone}/>
            </Field>
            <Field label="Note (opzionale)">
              <Input value={note} onChange={setNote} placeholder="Allergie, occasione speciale, posto vicino finestra..." multi/>
            </Field>

            {/* Footer ancorato: i pulsanti restano sempre visibili, i campi scrollano sopra */}
            <div style={{
              position: 'sticky', bottom: 0, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              margin: '20px -20px 0', padding: '12px 20px 24px',
              background: '#fff', boxShadow: '0 -8px 16px rgba(0,0,0,0.05)',
            }}>
              <button onClick={() => {
                try {
                  localStorage.setItem('byup_booking', JSON.stringify({
                    venue: venue?.name || editBooking?.venue || 'Ristorante',
                    date, time, people, name, phone, note,
                    createdAt: Date.now(),
                  }));
                } catch {}
                setStep(1);
              }} style={{
                height: 54, flexShrink: 0, background: PINK_X, color: '#fff',
                border: 'none', borderRadius: 999, fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(227,36,89,0.3)',
              }}>{isEdit ? 'Salva modifiche' : 'Conferma prenotazione'}</button>

              {isEdit && (
                <button onClick={() => onCancelBooking && onCancelBooking()} style={{
                  marginTop: 10, height: 52, flexShrink: 0, background: 'transparent', color: '#c0392b',
                  border: '1.5px solid #ecc9c4', borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Annulla prenotazione</button>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '20px 0 28px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: '#E8F5E9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a8a3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{isEdit ? 'Prenotazione aggiornata' : 'Prenotazione confermata'}</div>
            <div style={{ fontSize: 14, color: MUTED_X, marginBottom: 22 }}>
              Ti aspettiamo {date} alle {time} per {people} {people===1?'persona':'persone'}.
            </div>
            <div style={{ background: BG_X, borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 18 }}>
              <RowKV k="Locale" v={venue?.name || editBooking?.venue || 'Ristorante'}/>
              <RowKV k="Data" v={date}/>
              <RowKV k="Orario" v={time}/>
              <RowKV k="Coperti" v={people}/>
              <RowKV k="A nome di" v={name}/>
              <RowKV k="Telefono" v={phone}/>
              {note && <RowKV k="Note" v={note}/>}
            </div>
            <div style={{ fontSize: 12, color: MUTED_X, marginBottom: 12 }}>
              Riceverai un promemoria un'ora prima.
            </div>
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

const stepperBtn = {
  width: 38, height: 38, borderRadius: 999, border: `1px solid ${BORDER_X}`,
  background: '#fff', fontSize: 20, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit', color: TEXT_X,
};
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_X, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: '0 0 auto', padding: '8px 14px', borderRadius: 999,
      background: active ? TEXT_X : '#fff', color: active ? '#fff' : TEXT_X,
      border: `1px solid ${active ? TEXT_X : BORDER_X}`, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}
function Input({ value, onChange, placeholder, multi }) {
  const Tag = multi ? 'textarea' : 'input';
  return (
    <Tag value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={multi ? 3 : undefined} style={{
      width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${BORDER_X}`,
      fontSize: 14, fontFamily: 'inherit', resize: 'none', background: '#fff', color: TEXT_X,
      outline: 'none', boxSizing: 'border-box',
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
//   • URL  ?venue=a|b|c|original     → utile per ShortcutsPanel / demo
//   • window.__venueVariant = '…'    → override da console
// Default = 'original' (stile classico, definito sotto in questo file).
// Gli altri stili (a/b/c) vivono in venue-variants.jsx. Vedi Contesto-App.md §3.1.
function VenueScreen(props) {
  const variant = (() => {
    try {
      const v = new URLSearchParams(window.location.search).get('venue');
      if (['a','b','c','original'].includes(v)) return v;
    } catch {}
    return window.__venueVariant || 'original';
  })();
  if (variant === 'a' && window.VenueA) return <window.VenueA {...props}/>;   // Editorial / Magazine
  if (variant === 'b' && window.VenueB) return <window.VenueB {...props}/>;   // Cinematic / Tasting menu
  if (variant === 'c' && window.VenueC) return <window.VenueC {...props}/>;   // Operativo / Resy-style
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
      width: '100%', height: '100%', background: '#fff', position: 'relative',
      fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
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
          background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
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
            background: saved ? PINK_X : 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            transition: 'background 0.18s',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#fff' : 'none'} stroke={saved ? '#fff' : TEXT_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61 a 5.5 5.5 0 0 0 -7.78 0 L 12 5.67 l -1.06 -1.06 a 5.5 5.5 0 0 0 -7.78 7.78 l 1.06 1.06 L 12 21.23 l 7.78 -7.78 1.06 -1.06 a 5.5 5.5 0 0 0 0 -7.78 z"/></svg>
          </button>
          <button onClick={() => moreOpen ? closeMore() : setMoreOpen(true)} style={{
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={TEXT_X}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
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
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}>
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
                background: '#fff', opacity: i === photoIdx ? 1 : 0.45,
                transition: 'width 0.25s, opacity 0.25s',
              }}/>
            ))}
          </div>
          {/* Logo — straddles hero bottom edge */}
          <div style={{
            position: 'absolute', right: 20, bottom: -40, zIndex: 5,
            width: 80, height: 80, borderRadius: 999,
            background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '3px solid rgba(255,255,255,0.95)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: 999,
              background: 'linear-gradient(135deg, #FFD3DC 0%, #FFB0C0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: PINK_X, fontFamily: 'Georgia, serif',
            }}>CP</div>
          </div>
        </div>

        {/* Status badges row */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 20px 0 20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: '#0a8a3a', background: '#e6f5e9',
            padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap',
          }}>APERTO</span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: TEXT_X, background: '#FFE8B0',
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
                    background: filled ? PINK_X : '#f0e6e9',
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
              <AwardTag>Top 10 Roma 2025</AwardTag>
              <AwardTag>Gambero Rosso</AwardTag>
              <AwardTag>Tripadvisor Excellence</AwardTag>
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

          {/* Piatti in evidenza */}
          <Section title="Chef consiglia">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {dishes.map((p, i) => {
                const names = ['Cacio e Pepe', 'Carbonara', 'Amatriciana', 'Tonnarello', 'Supplì', 'Tiramisù'];
                return (
                  <div key={i} style={{
                    borderRadius: 16, overflow: 'hidden',
                    background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                  }}>
                    <div style={{ height: 140, overflow: 'hidden' }}>
                      <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_X }}>{names[i]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Recensioni */}
          <Section title="Cosa dicono di noi">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r, i) => (
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
          </Section>

          {/* Mappa */}
          <Section title="Dove siamo">
            <div style={{ height: 160, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
              <VenueMapThumbnail lat={v.lat || 41.9065} lng={v.lng || 12.4642}/>
              <button onClick={onMap} style={{
                position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
                background: '#fff', border: 'none', borderRadius: 999,
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
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 0 34px', zIndex: 1101,
            animation: moreClosing
              ? 'moreSheetDown 0.28s cubic-bezier(0.32,0.72,0,1) forwards'
              : 'moreSheetUp 0.30s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8db', borderRadius: 999, margin: '8px auto 16px' }}/>
            <MoreRow label="Condividi" icon="↗"/>
            <div style={{ height: 1, background: BORDER_X, margin: '6px 20px' }}/>
            <MoreRow label="Segnala questo locale" icon="⚠" danger
              onClick={() => { closeMore(); setReportOpen(true); setReportSent(false); setReportReason(null); }}/>
          </div>
        </>
      )}

      {/* Report sheet */}
      {reportOpen && (
        <div onClick={() => setReportOpen(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '8px 20px 30px', maxHeight: '80%', overflowY: 'auto',
          }}>
            <div style={{ width: 40, height: 4, background: '#e0d8db', borderRadius: 999, margin: '8px auto 16px' }}/>
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
                      background: reportReason === r ? '#FCE9EE' : '#fff',
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
          flex: 1, height: 58, background: '#fff', color: TEXT_X,
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
        background: open ? PINK_X : '#FFF4E8',
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
          background: '#fff', border: `1px solid ${BORDER_X}`,
          borderRadius: 12, padding: '6px 12px',
          fontSize: 12, color: MUTED_X, fontWeight: 500,
          whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        }}>{info}</span>
      )}
    </div>
  );
}
// Premi: outline minimal con icona alloro
function AwardTag({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#fff', color: TEXT_X, padding: '6px 12px 6px 10px', borderRadius: 999,
      fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
      border: `1px solid ${BORDER_X}`,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEXT_X} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9 a 6 6 0 0 0 12 0 V3 H6 z M12 15 v 6 M8 21 h 8"/>
      </svg>
      {children}
    </span>
  );
}
function InfoRow({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 999, background: '#fff', border: `1px solid ${BORDER_X}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: TEXT_X }}>{icon}</div>
      <div style={{ fontSize: 13, color: TEXT_X, flex: 1 }}>{label}</div>
    </div>
  );
}
function SedeRow({ city, addr }) {
  return (
    <div style={{ background: BG_X, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{city}</div>
      <div style={{ fontSize: 12.5, color: MUTED_X }}>{addr}</div>
    </div>
  );
}
function SocialDot({ label }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 999, background: TEXT_X, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, fontFamily: 'serif',
    }}>{label}</div>
  );
}

Object.assign(window, { ProfileScreen, VenueScreen, BookingSheet });
