export const PN_WIDGET_CATALOG = [
  { id: 'financials',        name: 'Andamento incassi',   desc: 'Incassi + scontrino medio + coperti, switch automatico', component: 'WidgetFinancials',        defaultSize: { w: 2, h: 1 }, category: 'Incassi' },
  { id: 'incassi',           name: 'Solo incassi',        desc: 'Oggi/Settimana/Mese con sparkline',                      component: 'WidgetIncassi',           defaultSize: { w: 2, h: 1 }, category: 'Incassi' },
  { id: 'kpi-vendita',       name: 'KPI di vendita',      desc: 'Scontrino medio e coperti per periodo',                  component: 'WidgetKpiVendita',        defaultSize: { w: 1, h: 2 }, category: 'Statistiche' },
  { id: 'riempimento',       name: 'Riempimento',         desc: 'Tasso di occupazione + fasce orarie',                    component: 'WidgetRiempimento',       defaultSize: { w: 2, h: 1 }, category: 'Statistiche' },
  { id: 'prenotazioni-oggi', name: 'Prenotazioni oggi',   desc: 'Lista live coperti del giorno',                          component: 'WidgetPrenotazioniOggi',  defaultSize: { w: 1, h: 2 }, category: 'Sala' },
  { id: 'tavoli-stato',      name: 'Stato tavoli',        desc: 'Mappa visiva sala in tempo reale',                       component: 'WidgetTavoliStato',       defaultSize: { w: 1, h: 2 }, category: 'Sala' },
  { id: 'top-piatti',        name: 'Top piatti',          desc: 'Classifica settimanale per ricavo',                      component: 'WidgetTopPiatti',         defaultSize: { w: 1, h: 2 }, category: 'Menu' },
  { id: 'recensioni',        name: 'Recensioni recenti',  desc: 'Ultime recensioni e media stelle',                       component: 'WidgetRecensioni',        defaultSize: { w: 1, h: 2 }, category: 'Reputazione', theme: 'aurora' },
  { id: 'azioni',            name: 'Azioni rapide',       desc: '8 shortcut launcher (full row, ridimensionabile)',        component: 'WidgetAzioni',            defaultSize: { w: 4, h: 2 }, category: 'Utilità', fixedSize: true },
  { id: 'coperti-sett',      name: 'Coperti settimana',   desc: 'Bar chart 7 giorni',                                     component: 'WidgetCopertiSettimana',  defaultSize: { w: 2, h: 1 }, category: 'Statistiche' },
  { id: 'cucina-live',       name: 'Cucina live',         desc: 'Ordini in cottura e pronti',                             component: 'WidgetCucinaLive',        defaultSize: { w: 1, h: 2 }, category: 'Cucina' },
]

export const DEFAULT_LAYOUT = [
  { id: 'prenotazioni-oggi', size: { w: 1, h: 2 } },
  { id: 'financials',        size: { w: 2, h: 1 } },
  { id: 'cucina-live',       size: { w: 1, h: 2 } },
  { id: 'tavoli-stato',      size: { w: 2, h: 1 } },
  { id: 'azioni',            size: { w: 4, h: 2 } },
  { id: 'riempimento',       size: { w: 2, h: 1 } },
  { id: 'top-piatti',        size: { w: 1, h: 2 } },
  { id: 'coperti-sett',      size: { w: 2, h: 1 } },
  { id: 'recensioni',        size: { w: 1, h: 2 } },
]
