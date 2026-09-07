// byup · KDS per tavolo — dati finti della route di anteprima.
// Da qui in giu' si butta tutto quando arriva l'API: la board legge
// `comande`, non questo file.

const alle = window.alle, MIN = window.MIN;

// ─── Dati finti ───────────────────────────────────────────────────────────
const ORA0 = alle(21, 10);
// Il piatto NON porta un id: glielo assegna la posizione, subito sotto.
// Con un contatore globale bastava inserire una comanda in mezzo all'elenco
// perche' tutte le uscite dei tavoli seguenti puntassero ai piatti sbagliati —
// e' successo due volte. Le uscite quindi indicano le POSIZIONI dei loro
// piatti dentro la comanda, che e' una cosa che non si sfasa mai.
const p = (nome, qty, cat, nota) => ({ nome, qty, cat, nota: nota || null });

const TAVOLI = [
  // normale: antipasti gia' mollati, primi sul fuoco da poco
  { id:'t23', n:23, sala:'Sala interna', cop:4, arrivo: ORA0 - 34*MIN,
    piatti:[ p('Fritto all\'Italiana',2,'Antipasti'), p('Carbonara',2,'Primi','Al dente'),
             p('Amatriciana',1,'Primi'), p('Tagliata di manzo',2,'Secondi','Al sangue') ],
    uscite:[ {id:'u1', ids:[0], avvio: ORA0-26*MIN, pronta: ORA0-18*MIN},
             {id:'u2', ids:[1,2], avvio: ORA0-6*MIN, pronta:null} ] },

  // FERMO: ha finito gli antipasti da un pezzo e non ha niente sul fuoco.
  // E' il tavolo per cui questo schermo esiste — la marcia si da' in anticipo.
  { id:'t14', n:14, sala:'Dehors', cop:6, arrivo: ORA0 - 40*MIN,
    piatti:[ p('Tagliere misto',2,'Antipasti'), p('Cacio e pepe',3,'Primi','Al punto'),
             p('Branzino al sale',2,'Secondi'), p('Patate al forno',2,'Contorni') ],
    uscite:[ {id:'u3', ids:[0], avvio: ORA0-30*MIN, pronta: ORA0-13*MIN} ] },

  // IL PEGGIORE: sul fuoco da 17 minuti. Uno solo diventa scuro, ed e' questo.
  { id:'t7', n:7, sala:'Sala interna', cop:2, arrivo: ORA0 - 25*MIN,
    piatti:[ p('Impepata di cozze',1,'Antipasti'), p('Spaghetti aglio e olio',2,'Primi') ],
    uscite:[ {id:'u4', ids:[0,1], avvio: ORA0-17*MIN, pronta:null} ] },

  // uscita COMPOSTA: due pizze piu' un primo, partiti insieme perche' quel
  // tavolo deve mangiare insieme. La categoria non e' il recinto.
  { id:'t19', n:19, sala:'Dehors', cop:3, arrivo: ORA0 - 16*MIN,
    piatti:[ p('Margherita',1,'Pizze'), p('Diavola',1,'Pizze'), p('Carbonara',1,'Primi'),
             p('Tiramisu',3,'Dolci') ],
    uscite:[ {id:'u5', ids:[0,1,2], avvio: ORA0-4*MIN, pronta:null} ] },

  // DUE uscite in marcia insieme: il risotto e' partito prima perche' ci mette
  // il doppio, e deve uscire insieme al resto dei primi.
  { id:'t26', n:26, sala:'Sala interna', cop:8, arrivo: ORA0 - 22*MIN,
    piatti:[ p('Risotto ai funghi',3,'Primi'), p('Cacio e pepe',2,'Primi'),
             p('Amatriciana',2,'Primi'), p('Pollo alla diavola',4,'Secondi'),
             p('Cicoria ripassata',2,'Contorni') ],
    uscite:[ {id:'u6', ids:[0], avvio: ORA0-11*MIN, pronta:null},
             {id:'u7', ids:[1,2], avvio: ORA0-3*MIN, pronta:null} ] },

  // appena arrivato: niente ancora mandato, e va bene cosi'
  { id:'t31', n:31, sala:'Saletta', cop:5, arrivo: ORA0 - 2*MIN,
    piatti:[ p('Carciofi alla giudia',3,'Antipasti'), p('Tagliere misto',1,'Antipasti'),
             p('Cacio e pepe',2,'Primi'), p('Tagliata di manzo',3,'Secondi') ],
    uscite:[] },

  // ── E DUE COMANDE CHE NON SONO TAVOLI ─────────────────────────────────
  // Nel servizio vero (`cucina-data.jsx`) quasi meta' dei ticket sono asporto,
  // delivery o banco: hanno `customer` e `pickup` e nessun `table`. Un monitor
  // che sostituisce la Visualizzazione Ristorante deve saperle mostrare, o
  // perde meta' del servizio. Qui sono due su nove — il monitor resta
  // principalmente un monitor di sala, ma il caso c'e' e si vede.
  { id:'o1', tipo:'asporto', cliente:'Anna Bianchi', ritiro: alle(21, 35),
    arrivo: ORA0 - 9*MIN,
    piatti:[ p('Fritto all\'Italiana',1,'Antipasti'), p('Amatriciana',2,'Primi') ],
    uscite:[ {id:'w1', ids:[0], avvio: ORA0-5*MIN, pronta:null} ] },

  { id:'o2', tipo:'delivery', partner:'glovo', cliente:'Luca Verdi', ritiro: alle(21, 22),
    arrivo: ORA0 - 14*MIN,
    piatti:[ p('Pollo alla diavola',1,'Secondi'), p('Patate al forno',1,'Contorni') ],
    uscite:[ {id:'w2', ids:[0,1], avvio: ORA0-7*MIN, pronta:null} ] },

  // tavolo lungo: tutto mollato, aspetta solo il dolce
  { id:'t12', n:12, sala:'Sala interna', cop:2, arrivo: ORA0 - 62*MIN,
    piatti:[ p('Tagliere misto',1,'Antipasti'), p('Amatriciana',2,'Primi'),
             p('Branzino al sale',2,'Secondi'), p('Panna cotta',2,'Dolci') ],
    uscite:[ {id:'u8', ids:[0], avvio: ORA0-55*MIN, pronta: ORA0-48*MIN},
             {id:'u9', ids:[1], avvio: ORA0-40*MIN, pronta: ORA0-33*MIN},
             {id:'u10', ids:[2], avvio: ORA0-24*MIN, pronta: ORA0-14*MIN} ] },
];

// Gli id si assegnano qui, dalla comanda e dalla posizione: `t12-3`. Sono
// leggibili in ispezione e non dipendono dall'ordine dell'elenco.
TAVOLI.forEach(t => {
  t.piatti.forEach((x, i) => { x.id = t.id + '-' + i; });
  t.uscite.forEach(u => { u.ids = u.ids.map(i => t.piatti[i].id); });
});


window.KDS_TAVOLI_MOCK = TAVOLI;
window.KDS_TAVOLI_MOCK_ORA = ORA0;
