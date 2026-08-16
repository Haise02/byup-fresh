// Centro assistenza — accordion categorie + cards tutorial

function SupTutorials({ openCat, setOpenCat, onOpenTutorial, search }) {
  const filtered = !search ? SUP_TUTORIAL_CATS : SUP_TUTORIAL_CATS
    .map(c => ({...c, tutorials: c.tutorials.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
    )}))
    .filter(c => c.tutorials.length > 0);

  return (
    <div style={{
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 14,
      padding: 22,
    }}>
      <div style={{marginBottom: 18}}>
        <h2 style={{margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Centro assistenza</h2>
        <p style={{margin: 0, fontSize: 12.5, color: PN.MUTED}}>Guide dettagliate e video tutorial per ogni funzionalità della piattaforma</p>
      </div>

      {filtered.length === 0 && (
        <div style={{padding:'30px 12px', textAlign:'center', color: PN.MUTED, fontSize: 13}}>
          Nessuna guida trovata per "{search}"
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        {filtered.map(cat => {
          const isOpen = openCat === cat.id || !!search;
          return (
            <div key={cat.id} style={{
              background: PN.SIDE_BG,
              border: `1px solid ${PN.BORDER_SOFT}`,
              borderRadius: 10,
              overflow:'hidden',
            }}>
              <button onClick={() => setOpenCat(isOpen ? null : cat.id)} style={{
                width:'100%', display:'flex', alignItems:'center', gap: 12,
                padding: '12px 16px',
                background:'transparent', border:'none',
                cursor:'pointer', fontFamily:'inherit',
                color: PN.TEXT, textAlign:'left',
              }}>
                <span style={{display:'inline-flex'}}>{(BuIcons[cat.icon]||BuIcons.doc)({size: 16, color: 'currentColor'})}</span>
                <span style={{flex: 1, fontSize: 13, fontWeight: 600}}>
                  {cat.title} <span style={{color: PN.MUTED, fontWeight: 500}}>· {cat.tutorials.length} guide tutorial</span>
                </span>
                <span style={{display:'inline-flex', color: PN.MUTED,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}><BuIcons.chevronDown size={14}/></span>
              </button>

              {isOpen && (
                <div style={{
                  display:'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  padding: '4px 14px 14px',
                }}>
                  {cat.tutorials.map(t => (
                    <SupTutorialCard key={t.id} tutorial={t} onClick={() => onOpenTutorial({...t, catTitle: cat.title})}/>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupTutorialCard({ tutorial, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER}`,
      borderRadius: 10,
      padding: 12,
      textAlign:'left',
      cursor:'pointer', fontFamily:'inherit',
      transition:'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = PN.CARD_SHADOW_HOVER; e.currentTarget.style.borderColor = PN.PINK_SOFT; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = PN.BORDER; }}
    >
      <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, marginBottom: 6, lineHeight: 1.4}}>
        {tutorial.title}
      </div>
      <div style={{fontSize: 11.5, color: PN.MUTED, lineHeight: 1.5, marginBottom: 10, minHeight: 48}}>
        {tutorial.desc}
      </div>
      <div style={{display:'flex', alignItems:'center', gap: 12, fontSize: 11, color: PN.MUTED}}>
        <span style={{display:'inline-flex', alignItems:'center', gap: 4}}>
          <BuIcons.monitor size={12}/> {tutorial.mins} min
        </span>
        <span style={{display:'inline-flex', alignItems:'center', gap: 4}}>
          <BuIcons.doc size={12}/> {tutorial.read} min di lettura
        </span>
      </div>
    </button>
  );
}

window.SupTutorials = SupTutorials;
