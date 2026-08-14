// Hubble · Dashboard — la panoramica.
//
// Non è «Analisi Dati» con meno grafici: Analisi Dati risponde a «come sta
// andando byup», guardando i numeri a fondo e per sette tagli diversi. Questa
// risponde a un'altra domanda, quella che ci si fa alle nove del mattino:
// «che cosa devo guardare oggi?».
//
// Per questo i riquadri arrivano da sezioni DIVERSE — rubrica, marketing,
// workflow, agenti, assistenza — e ognuno porta con sé il collegamento al
// posto dove si agisce. Una panoramica da cui non si può partire è un poster.

const { useState: useStatePn, useMemo: useMemoPn } = React;

function PnRiquadro({ titolo, sotto, azione, onAzione, children, span = 1, tinta }) {
  return (
    <div style={{
      gridColumn: `span ${span}`, background: '#fff', border: `1px solid ${ADM.BORDER}`,
      borderRadius: 14, boxShadow: ADM.CARD_SHADOW, display: 'flex', flexDirection: 'column', minWidth: 0,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 17px 12px', display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: `1px solid ${ADM.BORDER_SOFT}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {tinta && <span style={{ width: 6, height: 6, borderRadius: 2, background: ADM[tinta] || tinta, flexShrink: 0 }}/>}
            <span style={{ fontSize: 14.6, fontWeight: 700, color: ADM.TEXT, letterSpacing: '-0.015em' }}>{titolo}</span>
          </div>
          {sotto && <div style={{ fontSize: 12.6, color: ADM.MUTED, marginTop: 3, lineHeight: 1.45 }}>{sotto}</div>}
        </div>
        {azione && (
          <button onClick={onAzione} className="adm-textlink" style={{
            background: 'transparent', border: 'none', color: ADM.PINK_DARK, fontSize: 12.8, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, padding: '2px 0',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>{azione} <BuIcons.chevronRight size={13}/></button>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

// Una riga di elenco dentro un riquadro.
function PnRiga({ icona, tinta, titolo, sotto, valore, valoreTono, ultimo, onClick }) {
  const Ic = icona ? BuIcons[icona] : null;
  return (
    <div onClick={onClick} className={onClick ? 'hub-riga' : undefined} style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '10px 17px',
      borderBottom: ultimo ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
    }}>
      {Ic && (
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: ADM[tinta + '_SOFT'] || ADM.NEUTRAL_SOFT, color: ADM[tinta] || ADM.MUTED,
        }}><Ic size={14}/></span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.6, fontWeight: 600, color: ADM.TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titolo}</div>
        {sotto && <div style={{ fontSize: 12.2, color: ADM.MUTED, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sotto}</div>}
      </div>
      {valore != null && (
        <span style={{
          fontSize: 13.6, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
          color: valoreTono ? (ADM[valoreTono] || valoreTono) : ADM.TEXT,
        }}>{valore}</span>
      )}
    </div>
  );
}

function HubPanoramicaPage({ onNav }) {
  const vai = (r, o) => (onNav || window.__hubNav || (() => {}))(r, o);

  const dati = useMemoPn(() => {
    // La settimana è mobile: gli ultimi 7 giorni da adesso, non dal lunedì.
    const inSettimana = (d) => d && (Date.now() - new Date(d).getTime()) < 7 * 86400000;
    const senzaConsenso = CONTATTI.filter(c => c.consensoMail === false).length;
    // I ricavi settimanali: il canone mensile dei locali col piano a
    // pagamento ancora vivo (né annullato né eliminato), spalmato sulla
    // settimana. È la stima del mock, non la contabilità.
    const paganti = CONTATTI.filter(c => c.tipo === 'locale' && c.piano && c.piano !== 'free'
      && c.ciclo !== 'annullato' && c.ciclo !== 'eliminato');
    const ricaviSettimana = Math.round(
      paganti.reduce((s, c) => s + ((PIANI.find(p => p.id === c.piano) || {}).price || 0), 0) / 4.345);
    return {
      senzaConsenso,
      locali: CONTATTI.filter(c => c.tipo === 'locale').length,
      utentiApp: CONTATTI.filter(c => c.tipo === 'utente').length,
      staff: CONTATTI.filter(c => c.tipo === 'staff').length,
      localiSettimana: CONTATTI.filter(c => c.tipo === 'locale' && inSettimana(c.iscritto)).length,
      utentiSettimana: CONTATTI.filter(c => c.tipo === 'utente' && inSettimana(c.iscritto)).length,
      paganti: paganti.length, ricaviSettimana,
      agentiErrore: HUB_AGENTI.filter(a => a.stato === 'errore'),
      ticket: SEGNALAZIONI.filter(s => s.stato === 'nuova').length,
      chiamate: RICHIAMATE.filter(r => r.stato === 'attesa').length,
      certificazioni: CERTIFICAZIONI.filter(c => c.stato === 'pending').length,
      programmate: [...HUB_MAIL, ...HUB_SMS].filter(x => x.stato === 'programmata'),
      dominiKo: HUB_DOMINI.filter(d => !(d.spf && d.dkim && d.dmarc)),
    };
  }, []);

  // Le cose che chiedono una decisione oggi, in ordine di quanto bruciano.
  const dafare = [
    dati.agentiErrore.length && { icona: 'sparkles', tinta: 'DANGER', t: `${dati.agentiErrore.length} agent${dati.agentiErrore.length === 1 ? 'e' : 'i'} in errore`, s: dati.agentiErrore[0].nome + ' — ' + dati.agentiErrore[0].ultimoEsito.slice(0, 70) + '…', r: 'agent' },
    dati.ticket && { icona: 'ticket', tinta: 'WARN', t: `${dati.ticket} ticket da smistare`, s: 'Segnalazioni ancora senza risposta', r: 'assistenza' },
    dati.chiamate && { icona: 'headsetFill', tinta: 'WARN', t: `${dati.chiamate} richiami in attesa`, s: 'Solo piani Plus e Business', r: 'assistenza' },
    dati.dominiKo.length && { icona: 'globe', tinta: 'WARN', t: `${dati.dominiKo.length} domin${dati.dominiKo.length === 1 ? 'io' : 'i'} con record incompleti`, s: dati.dominiKo.map(d => d.dominio).join(', ') + ' — non può spedire', r: 'domini' },
    dati.certificazioni && { icona: 'shield', tinta: 'INFO', t: `${dati.certificazioni} certificazioni da verificare`, s: 'Documenti caricati dai locali', r: 'assistenza' },
    dati.programmate.length && { icona: 'calendar', tinta: 'INFO', t: `${dati.programmate.length} invii programmati`, s: dati.programmate.map(p => p.nome).join(' · '), r: 'mkt-mail' },
  ].filter(Boolean);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HubStile/>

      {/* Il saluto in vetrina: è la prima schermata della console, e vale la
          pena che dica che cosa è questo posto. Il gradiente del marchio vive
          qui e in pochi altri momenti — non sotto le tabelle. */}
      <div style={{
        borderRadius: 18, padding: '22px 24px', color: '#fff', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(115deg, #C4083E 0%, #E01372 42%, #A50FC4 100%)',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, opacity: 0.42,
          background: 'radial-gradient(620px 260px at 88% -40%, rgba(255,255,255,0.55), transparent 68%)',
        }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 11.6, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>Buongiorno, Marco</div>
            <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 7, lineHeight: 1.2 }}>
              Byup a colpo d'occhio
            </div>
          </div>
          <div style={{ display: 'flex', gap: 26, flexShrink: 0 }}>
            {[
              { l: 'Locali', v: fmtNum(dati.locali) },
              { l: 'Utenti App', v: fmtNum(dati.utentiApp) },
              { l: 'Utenti Staff', v: fmtNum(dati.staff) },
            ].map(x => (
              <div key={x.l}>
                <div style={{ fontSize: 11.2, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.72 }}>{x.l}</div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 3, lineHeight: 1 }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Riga di numeri trasversali: la crescita della settimana (locali e
          utenti app entrati in rubrica) e quanto vale, in canoni, la base dei
          locali paganti. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
        <HubTile etichetta="Locali negli ultimi 7 giorni" valore={fmtNum(dati.localiSettimana)} icona="store" tono="OK"
          sotto={`su ${fmtNum(dati.locali)} locali in rubrica`} onClick={() => vai('contatti')}/>
        <HubTile etichetta="Utenti negli ultimi 7 giorni" valore={fmtNum(dati.utentiSettimana)} icona="smartphone"
          sotto={`su ${fmtNum(dati.utentiApp)} utenti app in rubrica`} onClick={() => vai('contatti')}/>
        <HubTile etichetta="Ricavi settimanali" valore={fmtEur(dati.ricaviSettimana)} icona="money" tono="HUB_MAGENTA"
          sotto={`da ${dati.paganti} locali con piano a pagamento`} onClick={() => vai('team')}/>
      </div>

      {/* La griglia dei riquadri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14, alignItems: 'start' }}>

        <PnRiquadro span={2} titolo="Da fare oggi" tinta="PINK"
          sotto="Le cose che chiedono una decisione, dalla più urgente."
          azione="Vai all'assistenza" onAzione={() => vai('assistenza')}>
          {dafare.length === 0 && <HubVuoto icona="check" titolo="Niente in sospeso" desc="Le code sono vuote e gli agenti girano."/>}
          {dafare.map((x, i) => (
            <PnRiga key={i} icona={x.icona} tinta={x.tinta} titolo={x.t} sotto={x.s}
              ultimo={i === dafare.length - 1} onClick={() => vai(x.r)}/>
          ))}
        </PnRiquadro>

        <PnRiquadro titolo="Il team IA" tinta="HUB_VIOLA"
          sotto="Chi è acceso e che cosa ha prodotto."
          azione="Apri Agent" onAzione={() => vai('agent')}>
          {HUB_AGENTI.slice(0, 5).map((a, i) => (
            <PnRiga key={a.id} icona="sparkles" tinta={a.stato === 'errore' ? 'DANGER' : a.stato === 'attivo' ? 'HUB_VIOLA' : 'PLAN_FREE'}
              titolo={a.nome} sotto={a.ruolo}
              valore={a.stato === 'errore' ? 'errore' : a.stato === 'attivo' ? mkPc(a.esiti, a.esecuzioni) : 'fermo'}
              valoreTono={a.stato === 'errore' ? 'DANGER' : a.stato === 'attivo' ? 'OK' : 'MUTED'}
              ultimo={i === 4} onClick={() => vai('agent')}/>
          ))}
        </PnRiquadro>

        <PnRiquadro titolo="Elenchi più popolati" tinta="PINK"
          sotto="I segmenti attivi, ricalcolati adesso."
          azione="Apri Elenchi" onAzione={() => vai('elenchi')}>
          {HUB_ELENCHI.map(e => ({ e, n: elMembri(e) })).sort((a, b) => b.n - a.n).slice(0, 5).map((x, i, arr) => (
            <PnRiga key={x.e.id} icona={EL_TIPI[x.e.tipo].icona} tinta={x.e.tipo === 'attivo' ? 'OK' : 'PLAN_FREE'}
              titolo={x.e.nome} sotto={x.e.cartella} valore={fmtNum(x.n)}
              ultimo={i === arr.length - 1} onClick={() => vai('elenchi')}/>
          ))}
        </PnRiquadro>

        <PnRiquadro titolo="Ultime campagne" tinta="HUB_MAGENTA"
          sotto="Le mail partite e come sono andate."
          azione="Apri Mail" onAzione={() => vai('mkt-mail')}>
          {HUB_MAIL.filter(m => m.consegnate > 0).slice(0, 5).map((m, i, arr) => (
            <PnRiga key={m.id} icona="mailFill" tinta="HUB_MAGENTA" titolo={m.nome}
              sotto={`${fmtNum(m.consegnate)} consegnate · ${m.disiscritti} disiscritti`}
              valore={mkPc(m.aperte, m.consegnate)} valoreTono={m.aperte / m.consegnate > 0.5 ? 'OK' : 'TEXT'}
              ultimo={i === arr.length - 1} onClick={() => vai('mkt-mail')}/>
          ))}
        </PnRiquadro>

        <PnRiquadro titolo="Workflow al lavoro" tinta="HUB_VIOLA"
          sotto="Quanti contatti stanno attraversando ciascuno."
          azione="Apri Workflow" onAzione={() => vai('workflow')}>
          {HUB_WORKFLOW.filter(w => w.stato === 'attivo').sort((a, b) => b.inCorso - a.inCorso).slice(0, 5).map((w, i, arr) => (
            <PnRiga key={w.id} icona="flowFill" tinta="HUB_VIOLA" titolo={w.nome}
              sotto={`${fmtNum(w.completati)} completati`} valore={w.inCorso ? fmtNum(w.inCorso) + ' in corso' : '—'}
              valoreTono={w.inCorso ? 'WARN' : 'MUTED'} ultimo={i === arr.length - 1} onClick={() => vai('workflow')}/>
          ))}
        </PnRiquadro>

        <PnRiquadro span={2} titolo="La rubrica per ciclo di vita" tinta="PINK"
          sotto="Dove sta la base contatti in questo momento."
          azione="Apri Contatti" onAzione={() => vai('contatti')}>
          <div style={{ padding: '16px 17px 18px' }}>
            {Object.keys(CNT_CICLO).map(k => {
              const n = CONTATTI.filter(c => c.ciclo === k).length;
              const d = CNT_CICLO[k];
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span style={{ fontSize: 13.2, fontWeight: 600, color: ADM.TEXT, flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 13.2, fontWeight: 700, color: ADM.TEXT, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(n)}</span>
                    <span style={{ fontSize: 12, color: ADM.MUTED_SOFT, width: 46, textAlign: 'right' }}>{mkPc(n, CONTATTI.length)}</span>
                  </div>
                  <HubBarra valore={n} max={CONTATTI.length} color={d.color} altezza={6}/>
                </div>
              );
            })}
            <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 14, lineHeight: 1.55, paddingTop: 12, borderTop: `1px solid ${ADM.BORDER_SOFT}` }}>
              Chi non ha un ciclo di vita — utenti app e staff — non compare qui: non hanno un rapporto commerciale con byup, e infilarli in una scala che non li riguarda gonfierebbe ogni percentuale.
            </div>
          </div>
        </PnRiquadro>

        <PnRiquadro titolo="Consensi" tinta="WARN"
          sotto="Chi non si può contattare, e su che canale."
          azione="Filtra i contatti" onAzione={() => vai('contatti')}>
          <div style={{ padding: '16px 17px 18px' }}>
            {[
              { l: 'Consenso email', n: CONTATTI.filter(c => c.consensoMail).length, c: 'OK' },
              { l: 'Consenso SMS', n: CONTATTI.filter(c => c.consensoSms).length, c: 'INFO' },
              { l: 'Con telefono noto', n: CONTATTI.filter(c => c.telefono).length, c: 'TEAL' },
            ].map(x => (
              <div key={x.l} style={{ marginBottom: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                  <span style={{ fontSize: 13.2, fontWeight: 600, color: ADM.TEXT, flex: 1 }}>{x.l}</span>
                  <span style={{ fontSize: 13.2, fontWeight: 700, color: ADM.TEXT }}>{mkPc(x.n, CONTATTI.length)}</span>
                </div>
                <HubBarra valore={x.n} max={CONTATTI.length} color={x.c} altezza={6}/>
              </div>
            ))}
            <div style={{ fontSize: 12.4, color: ADM.MUTED, marginTop: 12, lineHeight: 1.55 }}>
              I {fmtNum(dati.senzaConsenso)} senza consenso email restano in rubrica e restano contattabili dal supporto: quello che non ricevono sono le campagne.
            </div>
          </div>
        </PnRiquadro>
      </div>
    </div>
  );
}

window.HubPanoramicaPage = HubPanoramicaPage;
