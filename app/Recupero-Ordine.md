# byup — Specifica tecnica: recupero dell'ordine da web app ad app

> 📍 **byup-Docs** › Recupero ordine webapp→app (spec tecnica) · [Indice](README.md)
>
> **Stato: DECISO** (spec tecnica di implementazione).
>
> 🧪 **Nel prototipo (parziale, percorso iOS)**: realizzati **banner** di recupero
> (20s, poi parcheggiato in Posta → Novità), **popup** di inserimento codice con
> **incolla auto-accettato** (stile OTP) e **caricamento simulato** → salto a
> `byup Menu.html#home` (Home + ordine demo). Vedi §"Esperienza utente per
> piattaforma" e §"Realizzazione nel prototipo".
> **Non** nel prototipo: l'**Install Referrer Android**, la **validazione del
> codice** (oggi accetta qualsiasi codice ≥4 cifre) e quindi lo **stato d'errore**.
>
> **Collegamenti**
> - Sintesi nel contesto di prodotto → [Contesto-App.md §G.7](Contesto-App.md)
> - Perché conta per il modello di ricavo (ordine webapp pagato in app = peso 0,5) → [Contesto-App.md §C](Contesto-App.md)
> - Redirect al download da asporto webapp → [Contesto-App.md §G.4](Contesto-App.md)
> - Forme dati del recupero → [Contratto-Dati.md §2.8](Contratto-Dati.md)
> - Difesa del canale anonimo webapp → [Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md)

## Obiettivo

Un utente crea un ordine dalla **web app** senza registrarsi, su un tavolo di un
locale. Per poter pagare dall'app deve scaricarla e aprirla. Questa specifica
definisce come l'ordine creato nel browser viene ritrovato dentro l'app appena
installata.

La strategia è **biforcata per piattaforma**, con un meccanismo manuale comune come
rete di sicurezza.

### Esperienza utente per piattaforma (la differenza chiave)

**Android — automatico, silenzioso (happy path).** L'identificativo dell'ordine
viaggia nel processo di installazione (Google Play **Install Referrer**), quindi
**durante l'onboarding il backend ha già ricevuto il codice e collegato l'ordine
all'account**. Conseguenza UX: appena l'utente **apre l'app e conferma i popup
iniziali** (permessi), **l'ordine è già caricato** — l'app porta direttamente al
flusso **Home + ordine**, **senza banner e senza inserire alcun codice**.
*(Fallback Android: se il referrer non arriva — niente Play Store, sideload, app
già installata — si ricade sul percorso manuale iOS qui sotto.)*

**iOS — manuale (come nel prototipo).** Apple non passa dati attraverso
l'installazione: niente collegamento automatico. Quindi, finiti i popup iniziali,
compare un **banner** *"Hai un ordine da pagare?"* (resta ~20s, poi si parcheggia
in **Posta → Novità**). Tap → **popup** con il **codice ordine**: l'utente lo
**digita o lo incolla** (tieni premuto → Incolla; l'incolla viene **accettato
automaticamente**, stile codice SMS). Conferma → **caricamento** → flusso
**Home + ordine**.

> In sintesi: su **Android** il recupero è invisibile (già fatto dal backend); su
> **iOS** è un'azione esplicita dell'utente (banner → codice). Il **codice manuale**
> resta il fallback comune a entrambe.

---

## 1. Generazione dell'ordine e del codice (lato web app + server)

Quando l'utente conferma l'ordine dalla web app:

1. Il server crea l'ordine e lo associa al contesto: `locale_id`, `tavolo_id`,
   timestamp di creazione, stato `orfano` (non ancora abbinato a un account app).
2. Il server genera un **codice ordine** breve (5–6 cifre) univoco e a vita
   limitata, legato a quell'ordine.
3. La web app rileva il sistema operativo del dispositivo via **user agent** per
   decidere cosa mostrare nella schermata finale (vedi §4).

Il codice ordine è la **fonte di verità persistente**: vive sul server e viene
mostrato sulla schermata web app. Non dipende mai dalla clipboard del telefono.

---

## 2. Ramo Android — Google Play Install Referrer API

> **Comportamento utente** (cosa vede, quando appare l'ordine) → vedi "Esperienza
> utente per piattaforma" qui sopra. Questa sezione è il **come tecnico**.

### Come funziona

L'identificativo dell'ordine viaggia **dentro il processo di installazione**, nel
parametro `referrer` del link al Play Store: il Play Store lo conserva e lo
restituisce all'app al primo avvio, che lo risolve in ordine e lo abbina
all'account (passi A–C sotto).

Riferimenti ufficiali:
- Guida libreria: https://developer.android.com/google/play/installreferrer/library
- Panoramica API: https://developer.android.com/google/play/installreferrer

### Requisiti d'ambiente
- Google Play Store versione **8.3.73 o successiva** sul dispositivo (praticamente
  tutti i device Android dal 2017 in poi).
- Account **Google Play Console**.
- Funziona **solo** per installazioni provenienti dal Play Store.

### Passo A — Link allo store con referrer (lato web app)

Il pulsante "Scarica l'app" sulla schermata finale Android punta al Play Store con
il parametro `referrer` che contiene l'identificativo dell'ordine (o un token che
il server sa risolvere in ordine). Esempio concettuale del parametro:

```
referrer=byup_order_id%3D<ID_ORDINE_O_TOKEN>
```

Il valore va URL-encoded. Tenere il payload compatto (l'API non è pensata per
grandi quantità di dati).

### Passo B — Dipendenza (lato app Android)

Nel `build.gradle` dell'app:

```groovy
dependencies {
    implementation "com.android.installreferrer:installreferrer:2.2"
}
```

### Passo C — Connessione al Play Store e lettura (al primo avvio)

```kotlin
private lateinit var referrerClient: InstallReferrerClient

referrerClient = InstallReferrerClient.newBuilder(context).build()
referrerClient.startConnection(object : InstallReferrerStateListener {
    override fun onInstallReferrerSetupFinished(responseCode: Int) {
        when (responseCode) {
            InstallReferrerResponse.OK -> {
                val response: ReferrerDetails = referrerClient.installReferrer
                val referrerUrl: String = response.installReferrer
                // Estrarre byup_order_id da referrerUrl,
                // chiamare il server, recuperare l'ordine, abbinarlo all'account.
                referrerClient.endConnection()
            }
            InstallReferrerResponse.FEATURE_NOT_SUPPORTED -> {
                // Play Store assente/troppo vecchio → ricadere sul codice manuale (banner).
            }
            InstallReferrerResponse.SERVICE_UNAVAILABLE -> {
                // Connessione non stabilita → ritentare o ricadere sul codice manuale.
            }
        }
    }

    override fun onInstallReferrerServiceDisconnected() {
        // Connessione persa (es. Play Store in aggiornamento):
        // ritentare startConnection() alla richiesta successiva.
    }
})
```

### Note operative critiche (dalla documentazione ufficiale)

- Il dato del referrer **resta disponibile per 90 giorni** e **non cambia** finché
  l'app non viene reinstallata.
- **Invocare l'API una sola volta**, alla prima esecuzione dopo l'installazione,
  per evitare chiamate inutili.
- Chiudere sempre la connessione con `endConnection()` per evitare leak.
- `startConnection()` è **asincrona**: gestire con cura il timing al primo avvio
  (race condition). L'app deve tentare la lettura del referrer prima di considerare
  l'utente "senza ordine".
- Il test del flusso reale richiede un'installazione vera dal Play Store (anche
  track interno) con un link contenente il referrer — non si testa comodamente in
  locale.

### Esito sul ramo Android
- Referrer trovato e risolto → ordine abbinato automaticamente, **nessun codice,
  nessun banner**.
- Referrer assente/non risolvibile (Play Store mancante, app già installata,
  install non da Play Store) → ricadere sul **codice manuale** (banner, vedi §3).

---

## 3. Ramo iOS + Fallback comune — codice manuale via banner

> **Comportamento utente** (banner, popup, incolla, tempistiche) → vedi "Esperienza
> utente per piattaforma" qui sopra. Qui restano solo **motivazione tecnica**,
> **scadenza** e **fallback**.

iOS **non dispone** di un equivalente dell'Install Referrer (Apple impedisce per
privacy il passaggio diretto di dati attraverso l'installazione): quindi su iOS il
**codice manuale è il metodo primario**, e su Android è il **fallback** quando il
referrer non arriva.

### Perché il banner si mostra a tutti

All'apertura **non si sa se quell'utente ha ordinato o no** dalla web app: per
questo il banner appare a **tutti i nuovi utenti**, con testo neutro (*"Hai ordinato
dal browser? Recupera il tuo ordine"*). Chi non ha ordinato lo **ignora** e sparisce
senza disturbo. *(Tempistica ≈20s, parcheggio in Posta → Novità e popup codice:
sezione "Esperienza utente per piattaforma".)*

### Scadenza del banner / notifica
- Legata allo **stato del tavolo lato server**: attivo finché il tavolo è aperto e
  l'ordine non è saldato.
- Si spegne al recupero dell'ordine, alla chiusura del tavolo, o a un **tetto
  massimo di sicurezza (~2 ore)**.
- Il timer parte dalla **creazione dell'ordine**, non dalla creazione dell'account.

### Fallback finale (codice perso)
Se l'utente perde il codice nel caso sfortunato (web app chiusa **+** nessun
recupero automatico): **va in cassa e paga lì**. Nessun recupero automatico per
contesto (scelta tra ordini di più tavoli) — genererebbe errori e contestazioni sul
conto. Il caso peggiore coincide con il flusso che sarebbe esistito comunque senza
Byup.

---

## 3.bis Errori e stati limite (popup codice manuale — UX)

Valgono per il **popup codice** (iOS, e fallback Android). La validazione è
**server-side**: l'app invia il codice, il server risponde ok/errore. Esito ok →
spinner *"Cerco il tuo ordine…"* → salto a Home + ordine. Esito ko → si **resta nel
popup** con una **riga di errore rossa sotto il campo**:

| Caso | Riga rossa (titolo) | Sottotesto |
|------|---------------------|-----------|
| Codice errato / inesistente | **Codice riscatto ordine errato** | Controlla il codice sulla schermata del browser e riprova. |
| Codice scaduto (tavolo chiuso / oltre ~2h) | **Codice scaduto** | L'ordine non è più recuperabile: paga in cassa. |
| Ordine già recuperato / saldato | **Ordine già recuperato** | Questo ordine è già collegato a un account. |
| Errore di rete / caricamento fallito | **Qualcosa è andato storto** | Riprova tra un momento. |

**UX della riga d'errore**: testo rosso (es. `#E03131`, ~12.5px) **sotto il campo**;
il **bordo del campo diventa rosso** con un breve **shake**; il popup **non si
chiude**; l'errore **si azzera appena l'utente modifica** il codice. È un errore
**inline**, non un alert di sistema, coerente con gli altri form dell'app.

**Anti-abuso (rilevante)**: un codice di 5–6 cifre è **forzabile a tentativi**
(10⁵–10⁶ combinazioni). Serve un **rate limit sui tentativi di riscatto** per
device/account/IP + cooldown dopo N errori → vedi
[Sicurezza-AntiAbuso.md](Sicurezza-AntiAbuso.md). *(Da definire: soglia tentativi e
durata del blocco.)*

## 3.ter Realizzazione nel prototipo (cosa è simulato)

- **Percorso iOS realizzato** in [app.jsx](app.jsx)/[map.jsx](map.jsx): banner (20s,
  poi Posta → Novità) → popup codice (digita o **incolla auto-accettato**, stile
  OTP; anche il codice pieno a 6 cifre parte da solo) → **caricamento simulato
  (~1,6s)** → `window.location.href = 'byup Menu.html#home'` (Home + ordine con
  `activeOrder` demo).
- **Non simulato**: Install Referrer Android (nativo), collegamento automatico in
  onboarding Android, e la **validazione del codice**. Il prototipo **accetta
  qualunque codice ≥4 cifre** e "trova" sempre l'ordine → lo **stato d'errore rosso
  qui sopra è specificato ma non ancora codificato**.

## 4. Schermata finale della web app — comportamento per piattaforma

La web app rileva il SO via user agent e differenzia la schermata finale, **ma il
codice resta sempre raggiungibile** su entrambe (perché "device Android" non
garantisce "referrer disponibile"):

| Piattaforma rilevata | Cosa mostra la schermata finale |
|---|---|
| **Android** | Pulsante "Scarica l'app" con `referrer`. Codice **non** in primo piano, ma accessibile sotto un "Problemi a ritrovare l'ordine? Ecco il tuo codice: 48 39 12" |
| **iOS** | Codice ordine **protagonista**, grande e visibile, più pulsante App Store |
| **Altro/sconosciuto** | Comportamento iOS (codice protagonista) come default sicuro |

### Perché il codice resta accessibile anche su Android
Casi in cui si è su Android ma il referrer **non** arriva: device senza Play Store
(alcuni Huawei/tablet/store alternativi), app già installata e riaperta,
installazione non proveniente dal Play Store. In questi casi il recupero automatico
fallisce: senza codice accessibile l'utente resterebbe bloccato. Mostrarlo in
secondo piano non costa nulla e copre i buchi.

---

## 5. Sintesi del flusso decisionale all'apertura dell'app

1. App si avvia (primo lancio dopo install); l'utente conferma i **popup iniziali**
   (permessi).
2. **Android**: durante l'onboarding il backend ha già letto l'**Install Referrer** e
   collegato l'ordine.
   - Referrer risolto → **subito dopo i popup l'ordine è già caricato** → Home +
     ordine. **Nessun banner, nessun codice.**
   - Referrer assente (no Play Store / sideload / app già installata) → percorso
     manuale (passo 3).
   - **iOS**: sempre percorso manuale (passo 3).
3. **Banner** *"Hai un ordine da pagare?"* dopo i popup → resta ~20s → si parcheggia
   in **Posta → Novità** (campanella in alto a destra).
4. Tap (sul banner o sulla voce in Posta) → **popup codice** → l'utente digita/incolla
   (incolla auto-accettato) → server valida:
   - **ok** → caricamento → Home + ordine;
   - **ko** → riga rossa nel popup (**"Codice riscatto ordine errato"** / scaduto /
     già recuperato — vedi §3.bis), si riprova.
5. Codice perso/non disponibile → **pagamento in cassa**.

---

## 6. Roadmap futura (fuori MVP)

Per togliere la digitazione del codice **anche su iOS**, valutare in seguito un
provider di deferred deep linking (Branch, AppsFlyer, Adjust, Dub) che incapsula sia
l'Install Referrer Android sia il matching iOS via `UIPasteboard.DetectionPattern`
(lettura del solo pattern dell'identificativo, senza vedere altri dati né scatenare
il banner "Incollato da…"). È ottimizzazione, non fondamenta: si introduce dopo la
validazione del prodotto, sulla base dei dati reali di abbandono al passaggio del
codice. Se si adotta un provider, conviene usarlo per **entrambe** le piattaforme e
dismettere il ramo Android fai-da-te.

---

## Nota sull'identità dell'account

Il meccanismo qui descritto (codice ordine + Install Referrer) è il modo in cui
l'**ordine orfano** viene agganciato. L'**identità dell'account app resta il numero
di telefono** (login OTP/biometria, vedi [Contesto-App.md §G.2](Contesto-App.md)):
il telefono serve da identità e da canale di notifica (es. "asporto pronto, codice
X"), il codice/referrer serve da matching dell'ordine.
