# Prompt ChatGPT — Widget "Byuppino AI" · 3 varianti di stile

## Come usarli

1. Apri ChatGPT (immagini) e **allega sempre**: il wireframe UX + 1 screenshot della Panoramica + 1 screenshot di Piani e abbonamenti (servono per il colore e la tipografia).
2. Incolla il **BLOCCO COMUNE**, poi **una sola variante** per volta (3 chat separate, così non contamina gli stili).
3. Chiedi formato orizzontale ~2400×1000 px, alta risoluzione.
4. Per iterare usa i prompt di rifinitura in fondo.

---

## BLOCCO COMUNE (da incollare prima di ogni variante)

```
Sei un UI designer senior. Devi produrre un MOCKUP UI ad alta fedeltà (non un wireframe, non un'illustrazione) di un singolo widget per una dashboard SaaS.

CONTESTO PRODOTTO
"byup Fresh" è un gestionale cloud per ristoranti italiani. Il widget si chiama "Byuppino AI": un assistente che esegue azioni dentro il gestionale al posto dell'utente (creare prenotazioni, chiudere conti, controllare la cucina). Utente tipo: ristoratore, usa il gestionale su desktop in servizio, di fretta.

ALLEGATI
- Immagine 1 = wireframe UX con la struttura richiesta (rispettala nella disposizione dei blocchi, NON nello stile: il wireframe è grezzo di proposito).
- Immagini 2-3 = screenshot del gestionale reale: il widget deve sembrare progettato dallo stesso designer, stessa famiglia visiva.
- La mascotte rossa nel wireframe (peluche con ciuffo a raggiera, faccia bianca, occhiolino, guance rosa, giacca nera e cravatta) è il personaggio ufficiale "Byuppino": riproducila fedele, stessa posa e stessi colori.

DESIGN SYSTEM DA RISPETTARE
- Colore brand coral: #FF5A5F, versione scura #E32459, profondità #B53338.
- Testo primario #0F1115, testo muted #6B7280, hairline rgba(15,17,21,0.07).
- Sfondo app #F5F6F8. Card bianche, angoli 14-18 px, ombre morbide e diffuse (0 6px 20px rgba(15,17,21,0.06)), MAI ombre nette o bordi duri.
- Colori di stato usati nel prodotto: viola #6D28D9 (prenotato), verde #15803D (libero), ambra #B45309 (attenzione).
- Tipografia: sans-serif geometrica moderna (tipo Inter/SF), titoli 700-800 con letter-spacing leggermente negativo, label piccole in maiuscolo con tracking ampio, numeri tabellari.
- Spaziatura generosa, griglia a 8 pt, gerarchia chiara.

VIETATO (rovina la coerenza col prodotto)
Niente gloss/bevel/effetto 3D sui bottoni, niente gradienti viola-blu generici da "AI startup", niente neon, niente glassmorphism esagerato con blur ovunque, niente stock-icon generiche, niente testo finto/illeggibile, niente watermark, niente cornici di browser o mockup di laptop.

STRUTTURA DEL WIDGET (dal wireframe, migliorata)
Widget orizzontale, due colonne.
- COLONNA SINISTRA (circa 26% larghezza): titolo "Byuppino AI", sottotitolo "Il tuo assistente in sala", un piccolo badge di stato "Online" con puntino verde, e sotto la mascotte Byuppino grande, a figura quasi intera, ben integrata (non incollata sopra: deve avere una base o un fondo che la accoglie).
- COLONNA DESTRA (il resto): area conversazione.
  1. Bolla messaggio dell'assistente, allineata a sinistra, con micro-avatar della mascotte: "Ciao Mario! Posso occuparmi io delle cose noiose. Cosa ti serve?"
  2. Bolla messaggio dell'utente, allineata a destra: "Sposta la prenotazione di Bianchi alle 21:30"
  3. NOVITÀ UX — sotto la risposta, una "card azione" compatta che mostra cosa l'AI sta per fare: icona calendario, testo "Prenotazione Bianchi · Tavolo 12 · 21:30", etichetta verde "Fatto" e link testuale "Annulla". Serve a rendere visibile e reversibile l'automazione.
  4. Riga di 4 chip "azioni rapide" cliccabili, ognuna con icona piccola a sinistra: "Nuova prenotazione", "Chiudi conto tavolo 7", "Piatti in ritardo", "Riepilogo di oggi".
  5. In basso, campo di input largo con placeholder "Scrivi cosa vuoi fare…", icona microfono e pulsante di invio circolare coral con freccia.
  6. Sotto l'input, micro-testo muted: "Byuppino esegue le azioni per te — puoi sempre annullarle."
Tutti i testi devono essere in ITALIANO ed esattamente quelli indicati, scritti in modo leggibile e corretto.

OUTPUT
Un'unica immagine, vista frontale piatta del solo widget su sfondo #F5F6F8 con un po' di margine attorno, formato orizzontale ~2400×1000 px, resa pulita e realistica come uno screenshot di prodotto.
```

---

## VARIANTE A — "Light Studio" (coerenza massima col gestionale)

```
STILE: chiaro, sobrio, identico alle card della dashboard.

- Widget = card bianca con angolo 18 px, bordo hairline chiarissimo, ombra morbida.
- La colonna sinistra ha un fondo coral molto tenue (sfumatura da #FFF1EF a bianco) che accoglie la mascotte, separata dalla conversazione con una linea hairline verticale.
- Titolo "Byuppino AI" in nero #0F1115, 700; la parola "AI" in coral #FF5A5F. Sottotitolo muted.
- Bolla dell'assistente: bianca con bordo hairline e angoli 14 px, testo scuro.
- Bolla dell'utente: coral pieno #FF5A5F, testo bianco, angolo interno più stretto.
- Card azione: bianca con bordo hairline, icona in quadrato coral tenue, etichetta "Fatto" verde #15803D su pill verde chiarissima.
- Chip azioni rapide: pill bianche con bordo hairline, testo #0F1115, icona muted; una chip in hover con fondo grigio chiarissimo.
- Input: campo bianco con bordo hairline, pulsante invio circolare coral pieno.
- Atmosfera: luminosa, arieggiata, molta aria bianca, zero rumore. Deve sembrare la stessa mano che ha disegnato le card "Coperti" e "Scontrino medio" della dashboard.
```

## VARIANTE B — "Sunset Console" (dark premium, come Azioni Rapide e Cucina live)

```
STILE: pannello scuro premium, come il blocco "AZIONI RAPIDE" e il monitor cucina del gestionale.

- Widget = pannello scuro con angolo 18 px: base blu-notte molto profonda (#141A24 → #0E1218) con un alone coral caldo in alto a destra (radial glow #FF6066 al 18% di opacità). Mai nero piatto.
- Bordo: nessuno; solo un inset ring caldo appena percettibile e un'ombra profonda coral-wine sotto.
- Titolo "Byuppino AI" bianco caldo #F5F5F7, sottotitolo grigio traslucido; badge "Online" con puntino verde menta.
- Colonna sinistra separata da una hairline chiarissima traslucida; dietro la mascotte un alone coral morbido che la fa "illuminare" dal fondo.
- Bolla dell'assistente: vetro scuro traslucido (bianco al 6-8% con hairline chiara), testo bianco caldo.
- Bolla dell'utente: coral pieno #FF5A5F con testo bianco — unico elemento davvero saturo, deve spiccare.
- Card azione: vetro scuro con ring verde menta traslucido, etichetta "Fatto" verde menta #6EE7B7.
- Chip azioni rapide: pill di vetro scuro con hairline chiara e testo bianco caldo; icone chiare.
- Input: barra di vetro scuro, testo placeholder grigio, pulsante invio circolare coral pieno con leggero bagliore.
- Atmosfera: da "console operativa" serale, elegante e calma, contrasto alto ma nessun colore fluo.
```

## VARIANTE C — "Aurora Coral" (vetro chiaro su mesh brand)

```
STILE: vetro chiaro Apple-like su fondo mesh coral-rosa, come la card promo "Porta un ristorante su byup" e il riquadro del piano.

- Widget su un fondo a mesh sfumato: coral #FF5A5F, rosa caldo e pesca chiarissimo che si fondono in modo morbido e diffuso (nessun bordo netto tra i colori, nessun viola-blu).
- Sopra il mesh, i contenuti vivono su superfici di vetro chiaro: bianco al 65-70% con leggero blur e bordo bianco luminoso, angoli 18 px.
- Titolo "Byuppino AI" nero #0F1115 su vetro; sottotitolo muted; badge "Online" pill di vetro con puntino verde.
- Mascotte appoggiata sul mesh, con un'ombra morbida a terra e un cerchio di luce chiara dietro.
- Bolla dell'assistente: vetro bianco traslucido, testo scuro. Bolla dell'utente: coral scuro #E32459 pieno, testo bianco.
- Card azione: vetro bianco più opaco con ring verde tenue.
- Chip azioni rapide: pill di vetro traslucido con bordo bianco, testo scuro.
- Input: barra di vetro bianca ben leggibile, pulsante invio coral pieno.
- Atmosfera: fresca, premium, "liquid glass" — il vetro deve rifrangere davvero il mesh sottostante, ma il testo resta sempre nitido e ad alto contrasto.
```

---

## Prompt di rifinitura (dopo la prima resa)

- **Testi sbagliati:** «Rigenera identica ma correggi i testi: devono essere esattamente questi, in italiano, ortografia perfetta: [incolla le stringhe].»
- **Troppo "AI generica":** «Togli i gradienti viola/blu e le luci al neon: la palette è solo coral #FF5A5F, bianco, grigi neutri e i colori di stato del prodotto.»
- **Mascotte fuori scala:** «Rimpicciolisci la mascotte al 70% e allineala in basso nella colonna sinistra; il titolo resta in alto.»
- **Densità:** «Aumenta l'aria: più padding interno, più spazio tra le bolle, chip su una sola riga.»
- **Versione compatta:** «Stessa variante, ma in formato card verticale stretta (rapporto 3:4) per la colonna destra della dashboard.»
- **Stato vuoto:** «Stessa variante, ma senza conversazione: solo saluto, 4 chip e input — è il primo avvio.»

## Note UX già incorporate (rispetto al wireframe)

- **Card azione con "Annulla"**: rende visibile e reversibile ciò che l'AI esegue — è il punto critico di fiducia per un assistente che agisce davvero sul gestionale.
- **Chip con icone e contestuali** (es. "Chiudi conto tavolo 7"): suggeriscono azioni sui dati reali del momento, non frasi generiche.
- **Badge stato "Online"** e micro-testo di disclaimer: fissano aspettative senza rubare spazio.
- **Microfono nell'input**: in servizio si hanno le mani occupate, il dettato è più realistico della tastiera.
