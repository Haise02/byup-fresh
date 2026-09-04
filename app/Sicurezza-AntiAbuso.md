# byup — Difesa da accessi remoti e ordini civetta

> 📍 **byup-Docs** › Sicurezza & anti-abuso · [Indice](README.md)
>
> **Stato: DISCUSSIONE IN CORSO. Le decisioni NON sono ancora prese.**
> Questo documento è un punto della situazione: riassume il problema, i principi
> emersi e le opzioni sul tavolo, non le scelte definitive.
>
> **Già deciso (eccezione)**: **nessun geofence** sull'accesso al tavolo, su
> nessun canale (vedi [Contesto-App.md §D / §G.2](Contesto-App.md)).
>
> **Collegamenti**
> - Sintesi nel contesto di prodotto → [Contesto-App.md §G.8](Contesto-App.md)
> - GPS (solo discovery, nessun geofence) → [Contesto-App.md §D / §G.2](Contesto-App.md)
> - Gate di sessione / ciclo di vita tavolo → [Contesto-App.md §G.5](Contesto-App.md)
> - Pagamento contestuale (difesa del canale webapp) → [Recupero-Ordine.md](Recupero-Ordine.md), [Contesto-App.md §G.4](Contesto-App.md)
> - Questioni aperte → [Contesto-App.md §G.9](Contesto-App.md)

---

## Il problema

Due attacchi distinti, spesso confusi ma con difese diverse:

1. **Attacco volumetrico da remoto** — qualcuno (es. "sta in Perù") apre la web app
   puntando a un tavolo di un locale a Roma e genera ordini all'infinito. Intasa la
   cucina, rovina l'esperienza del cliente vero seduto al tavolo, e di riflesso
   l'immagine di Byup.
2. **Ordine "civetta"** — un singolo ordine malizioso: si attiva/entra in un tavolo,
   si lancia un piatto vero in cucina, e si sparisce. Spreco di cibo, confusione in
   sala, sfregio all'immagine. È a basso volume e alta malizia, quindi il rate
   limiting da solo non lo ferma.

La via scartata: **il GPS** (da qualsiasi canale). Si falsifica banalmente (fake
GPS, emulatori), fa comparire un permesso che fa scappare l'utente onesto,
penalizza tutti per fermare pochi. Dà un falso senso di sicurezza: lo aggira il
nemico, lo rifiuta l'amico.

---

## Il principio di fondo emerso

La difesa non sta nel chiedere "dove sei" (geografia), ma nel rendere **impossibile
ordinare senza una sessione tavolo valida** e nel **togliere il movente**
all'attacco. Due idee chiave:

- **Il QR non è una chiave, è un puntatore.** Scansionarlo dice solo "sei al tavolo
  7 del locale X". Il diritto di ordinare nasce solo se quel tavolo ha una
  **sessione aperta e valida in quel momento**.
- **Non si impedisce ogni singolo attacco; si rende il costo di reiterare più alto
  del danno di un attacco singolo.**

---

## Contesto Byup (confermato)

- **QR del tavolo fisso** (stampato, sempre uguale, zero manutenzione) **ma con una
  sessione a stati** che cambia nel tempo. → Posizione comoda: il QR statico non è
  un problema perché non è lui ad autorizzare, è lo stato della sessione.
- La sessione può essere aperta **dal cameriere/cassa** oppure **allo scan del QR**
  (self-service).
- Esiste già un **tetto posti del tavolo**: oltre il limite, l'accesso viene
  segnalato al cameriere o richiede di essere **aggiunti/invitati** (da app o web
  app si possono aggiungere guest non loggati o invitare tramite link).

---

## Difese su cui c'è convergenza (trasversali)

- **Gate della sessione**: nessun ordine accettato se non esiste una sessione
  tavolo aperta lato server in quel momento. La sessione ha durata limitata (durata
  di un pasto), si chiude al pagamento o per timeout. Fuori da quella finestra il QR
  è inerte.
- **Rate limiting per sessione**: un tavolo fisico reale non genera 200 ordini in 5
  minuti. Tetto ordini/quantità per finestra temporale.
- **Rate limiting per IP/device**: un IP che martella ordini su tavoli/locali
  diversi è un pattern d'attacco evidente, bloccabile a monte.
- **Tetto posti del tavolo** (già esistente).
- **Rate limit sul riscatto del codice ordine** (recupero webapp→app, vedi
  [Recupero-Ordine.md](Recupero-Ordine.md)): il codice è di **sei cifre**, quindi
  **forzabile a tentativi** (10⁶ combinazioni). Serve un **tetto tentativi per
  device/account/IP** + **cooldown** dopo N errori, così l'inserimento manuale non
  diventa un canale di enumerazione degli ordini altrui. *(D-102, che rivede D-42: tre
  tentativi liberi, un minuto di blocco, altri tre, cinque minuti, altri tre, e al nono la
  chiusura del recupero dall'app per quel dispositivo, che toglie solo l'assistenza; il
  conteggio non decade col tempo — vedi Recupero-Ordine §3.bis.)*

---

## Biforcazione per canale (orientamento, non ancora deciso)

### Web app (canale anonimo)
- **Orientamento: pagamento contestuale obbligatorio.** Il piatto va in cucina solo
  dopo il pagamento. L'ordine civetta costa soldi all'attaccante a ogni piatto →
  non avviene. Nessun cameriere, nessun GPS, nessun attrito per l'onesto (paga
  comunque). Chi non vuole pagare prima, aspetta il cameriere.

### App (canale con identità)
- Si valuta di concedere il **"paga alla fine"** perché l'ordine è legato a un
  account reale, tracciabile e bloccabile.
- **L'identità NON protegge dal primo colpo** (il primo piatto civetta parte
  comunque); limita la **reiterazione** e, con il trust progressivo, può spostare
  anche il primo colpo dietro un pagamento.
- **Attenzione: il GPS da app NON è una difesa solida** — stessi difetti del GPS da
  web (falsificabile, fa scappare l'utente). La forza dell'app è **l'identità**, non
  la posizione.

---

## Leve di difesa specifiche per l'app (in discussione)

1. **Identità come deterrente alla reiterazione**: ban → per tornare serve nuovo
   account (email + telefono verificato). Trasforma attacco infinito in attacco che
   si esaurisce. Ma punisce *dopo* il danno.
2. **Trust progressivo dell'account** (candidata a difesa principale): un account
   appena creato è quasi anonimo (nessuno storico, niente da perdere). Il **"paga
   alla fine" non è un diritto da registrazione, è un privilegio sbloccato dopo che
   l'identità si consolida** (un pagamento andato a buon fine, o un tavolo aperto dal
   cameriere come garante). Account nuovo che auto-attiva un tavolo via QR → paga il
   primo ordine contestualmente, come la web app.
3. **Rate limiting per account**: un account reale non attiva 6 tavoli in 10 minuti
   in locali diversi. Tetti per account → allarme automatico.
4. **Device fingerprinting legato al ban**: legare il ban anche al dispositivo (non
   solo email/telefono) alza il costo del ritorno. Invisibile, nessun permesso (a
   differenza del GPS).
5. **Monitoraggio dei pattern**: l'identità fa da filo conduttore per correlare nel
   tempo comportamenti sospetti (tavoli attivati e mai pagati, ordini non ritirati,
   attivazioni geograficamente incoerenti). Richiede logging dal primo giorno.

---

## Barriere d'identità — calibrazione (in discussione)

- **Email**: barriera debole (usa-e-getta gratuiti e istantanei). Si tiene, ma non è
  un deterrente.
- **Telefono verificato via SMS**: prima barriera seria. Costo reale per reiterare.
  **Candidato a deterrente principale.** Da rinforzare bloccando i range di numeri
  virtuali noti.
- **Codice fiscale / SPID-CIE**: barriera potenzialmente fortissima, ma con tre
  avvertenze:
  - Il CF *digitato* non è verificato (si genera da dati anagrafici). Diventa forte
    solo se **verificato contro identità reale** (SPID/CIE/provider).
  - Chiederlo a tutti all'onboarding è **attrito enorme** in un'app consumer per
    ristoranti (utente affamato al tavolo) → rischio di uccidere la conversione.
  - È **dato sensibile (GDPR)**: base giuridica fragile se raccolto "per
    anti-abuso", obblighi di cifratura/conservazione.
  - **Orientamento**: NON all'ingresso per tutti, ma come **verifica progressiva e
    mirata** (sblocco funzioni ad alto valore/rischio, o step rinforzato per account
    già sospetti). Identità a livelli: anonimo (web app, paga prima) → identità base
    (app + telefono, paga dopo) → identità forte (SPID/CIE, casi specifici).
  - **Da chiarire**: il CF serve solo come anti-abuso o anche per esigenze di
    prodotto (fatturazione, ricevute fiscali, loyalty)? Se c'è una ragione di
    business indipendente, il calcolo costo/conversione cambia.

---

## Inquadramento ISO 27001:2022 (metodo per quando si scala)

La 27001 **non dice come bloccare un ordine civetta**: è un sistema di gestione
(ISMS) che obbliga a ragionare per rischi e a documentare scelte proporzionate. 93
controlli in 4 temi (Organizzativi 37, Persone 8, Fisici 14, Tecnologici 34). Non è
obbligatorio implementarli tutti, ma valutarli tutti, giustificando
inclusioni/esclusioni nello **Statement of Applicability**.

Controlli che mappano sull'impianto Byup:
- **Autenticazione sicura (A.8.5)** → telefono verificato, eventuale MFA/SPID, MFA
  per il gestionale.
- **Gestione identità e controllo accessi (A.5.15, A.5.16)** → "accesso attribuibile
  a una specifica entità per accountability e non ripudio" = esattamente il "ti
  banno, rifai email e numero".
- **Sicurezza reti (A.8.20–22), Monitoraggio (A.8.16), Logging (A.8.15)** → rate
  limiting, sessione, blocco IP, e soprattutto rilevare pattern d'attacco su scala
  (es. un IP che colpisce 12 tavoli in 3 città) + prove per ricostruire l'incidente.
- **Gestione incidenti, fornitori, secure coding, vulnerabilità, cifratura** →
  entrano in gioco con PSP, provider SMS, cloud, e raccolta CF/dati pagamento.

**Tempistica consigliata**: per l'MVP NON certificarsi (peso morto pre-seed). Ma
adottare subito due abitudini a costo quasi zero:
1. **Loggare tutto ciò che è sicurezza-rilevante** dal giorno 1 (attivazioni tavolo,
   ordini, ban, tentativi falliti). I log non si ricostruiscono a posteriori.
2. **Tenere un registro dei rischi** anche informale (come questo documento). È
   l'embrione dello Statement of Applicability.

La certificazione vera quando: team strutturato, dati sensibili in volume, e un
cliente/partner che la richiede contrattualmente.

---

## Decisioni ancora aperte

- Web app paga-prima: orientamento forte, ma da confermare.
- App: concedere "paga alla fine" sì/no, e con quale trust progressivo.
- **Trade-off principale ancora da sciogliere**: il trust progressivo (account nuovo
  paga il primo ordine) è la difesa più solida ma introduce attrito sulla **prima
  esperienza** dell'utente onesto. Due opzioni:
  - (a) applicarlo a **tutti** gli account nuovi → massima sicurezza, più attrito
    iniziale;
  - (b) applicarlo **solo agli account nuovi che auto-attivano un tavolo via QR**,
    lasciando liscio il "paga dopo" a chi è aperto/validato dal cameriere → attrito
    zero nel caso più comune. *(Orientamento verso (b), dipende dal peso self-service
    vs servizio al tavolo nel modello.)*
- Ruolo e profondità del CF/SPID (anti-abuso vs prodotto).
