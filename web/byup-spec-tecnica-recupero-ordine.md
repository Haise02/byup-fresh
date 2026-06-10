# Byup — Specifica tecnica: recupero dell'ordine da web app ad app

## Obiettivo

Un utente crea un ordine dalla **web app** senza registrarsi, su un tavolo di un locale. Per poter pagare dall'app deve scaricarla e aprirla. Questa specifica definisce come l'ordine creato nel browser viene ritrovato dentro l'app appena installata.

La strategia è **biforcata per piattaforma**, con un meccanismo manuale comune come rete di sicurezza:

- **Android** → recupero automatico via Google Play Install Referrer API (nessuna azione utente).
- **iOS** → recupero manuale tramite codice ordine.
- **Fallback comune** → codice ordine manuale, sempre raggiungibile su entrambe le piattaforme.

---

## 1. Generazione dell'ordine e del codice (lato web app + server)

Quando l'utente conferma l'ordine dalla web app:

1. Il server crea l'ordine e lo associa al contesto: `locale_id`, `tavolo_id`, timestamp di creazione, stato `orfano` (non ancora abbinato a un account app).
2. Il server genera un **codice ordine** breve (5–6 cifre) univoco e a vita limitata, legato a quell'ordine.
3. La web app rileva il sistema operativo del dispositivo via **user agent** per decidere cosa mostrare nella schermata finale (vedi §4).

Il codice ordine è la **fonte di verità persistente**: vive sul server e viene mostrato sulla schermata web app. Non dipende mai dalla clipboard del telefono.

---

## 2. Ramo Android — Google Play Install Referrer API

### Come funziona

Su Android l'identificativo dell'ordine viaggia **dentro il processo di installazione**, attraverso il parametro `referrer` del link al Play Store. Il Play Store lo conserva e lo restituisce all'app al primo avvio. Di conseguenza **su Android non serve mostrare né far digitare il codice nel banner**: se l'identificativo è stato passato all'installazione e l'app lo recupera, l'abbinamento avviene da solo, senza alcuna azione dell'utente e senza banner.

Riferimenti ufficiali:
- Guida libreria: https://developer.android.com/google/play/installreferrer/library
- Panoramica API: https://developer.android.com/google/play/installreferrer

### Requisiti d'ambiente
- Google Play Store versione **8.3.73 o successiva** sul dispositivo (praticamente tutti i device Android dal 2017 in poi).
- Account **Google Play Console**.
- Funziona **solo** per installazioni provenienti dal Play Store.

### Passo A — Link allo store con referrer (lato web app)

Il pulsante "Scarica l'app" sulla schermata finale Android punta al Play Store con il parametro `referrer` che contiene l'identificativo dell'ordine (o un token che il server sa risolvere in ordine). Esempio concettuale del parametro:

```
referrer=byup_order_id%3D<ID_ORDINE_O_TOKEN>
```

Il valore va URL-encoded. Tenere il payload compatto (l'API non è pensata per grandi quantità di dati).

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

- Il dato del referrer **resta disponibile per 90 giorni** e **non cambia** finché l'app non viene reinstallata.
- **Invocare l'API una sola volta**, alla prima esecuzione dopo l'installazione, per evitare chiamate inutili.
- Chiudere sempre la connessione con `endConnection()` per evitare leak.
- `startConnection()` è **asincrona**: gestire con cura il timing al primo avvio (race condition). L'app deve tentare la lettura del referrer prima di considerare l'utente "senza ordine".
- Il test del flusso reale richiede un'installazione vera dal Play Store (anche track interno) con un link contenente il referrer — non si testa comodamente in locale.

### Esito sul ramo Android
- Referrer trovato e risolto → ordine abbinato automaticamente, **nessun codice, nessun banner**.
- Referrer assente/non risolvibile (Play Store mancante, app già installata, install non da Play Store) → ricadere sul **codice manuale** (banner, vedi §3).

---

## 3. Ramo iOS + Fallback comune — codice manuale via banner

iOS **non dispone** di un equivalente dell'Install Referrer (Apple impedisce per privacy il passaggio diretto di dati attraverso l'installazione). Quindi su iOS si usa il codice manuale come metodo primario.

### Flusso banner (vale per iOS sempre, e per Android nei casi limite)

Poiché all'apertura dell'app **non si sa se quell'utente ha ordinato o no** dalla web app, all'avvio si mostra a **tutti i nuovi utenti** un **banner generico** in alto, con testo chiaro per chi non ha ordinato:

> "Hai ordinato dal browser? Recupera il tuo ordine"

- Dopo qualche secondo il banner sparisce e resta **parcheggiato nella sezione notifiche** in alto a destra.
- Chi ha un ordine tocca il banner → campo per inserire il **codice ordine** → recupero e abbinamento.
- Chi non ha ordinato lo ignora; sparisce senza dare fastidio.

### Scadenza del banner / notifica
- Legata allo **stato del tavolo lato server**: attivo finché il tavolo è aperto e l'ordine non è saldato.
- Si spegne al recupero dell'ordine, alla chiusura del tavolo, o a un **tetto massimo di sicurezza (~2 ore)**.
- Il timer parte dalla **creazione dell'ordine**, non dalla creazione dell'account.

### Fallback finale (codice perso)
Se l'utente perde il codice nel caso sfortunato (web app chiusa **+** nessun recupero automatico): **va in cassa e paga lì**. Nessun recupero automatico per contesto (scelta tra ordini di più tavoli) — genererebbe errori e contestazioni sul conto. Il caso peggiore coincide con il flusso che sarebbe esistito comunque senza Byup.

---

## 4. Schermata finale della web app — comportamento per piattaforma

La web app rileva il SO via user agent e differenzia la schermata finale, **ma il codice resta sempre raggiungibile** su entrambe (perché "device Android" non garantisce "referrer disponibile"):

| Piattaforma rilevata | Cosa mostra la schermata finale |
|---|---|
| **Android** | Pulsante "Scarica l'app" con `referrer`. Codice **non** in primo piano, ma accessibile sotto un "Problemi a ritrovare l'ordine? Ecco il tuo codice: 48 39 12" |
| **iOS** | Codice ordine **protagonista**, grande e visibile, più pulsante App Store |
| **Altro/sconosciuto** | Comportamento iOS (codice protagonista) come default sicuro |

### Perché il codice resta accessibile anche su Android
Casi in cui si è su Android ma il referrer **non** arriva: device senza Play Store (alcuni Huawei/tablet/store alternativi), app già installata e riaperta, installazione non proveniente dal Play Store. In questi casi il recupero automatico fallisce: senza codice accessibile l'utente resterebbe bloccato. Mostrarlo in secondo piano non costa nulla e copre i buchi.

---

## 5. Sintesi del flusso decisionale all'apertura dell'app

1. App si avvia (primo lancio dopo install).
2. **Android**: tenta lettura Install Referrer.
   - Trovato e risolto → abbina ordine in automatico. Fine. (nessun banner)
   - Non trovato → vai al passo 3.
   - **iOS**: vai direttamente al passo 3.
3. Mostra banner generico "Hai ordinato dal browser?" → parcheggia in notifiche.
4. Utente tocca → inserisce codice (preso dalla schermata web app) → abbina ordine.
5. Codice perso/non disponibile → pagamento in cassa.

---

## 6. Roadmap futura (fuori MVP)

Per togliere la digitazione del codice **anche su iOS**, valutare in seguito un provider di deferred deep linking (Branch, AppsFlyer, Adjust, Dub) che incapsula sia l'Install Referrer Android sia il matching iOS via `UIPasteboard.DetectionPattern` (lettura del solo pattern dell'identificativo, senza vedere altri dati né scatenare il banner "Incollato da…"). È ottimizzazione, non fondamenta: si introduce dopo la validazione del prodotto, sulla base dei dati reali di abbandono al passaggio del codice. Se si adotta un provider, conviene usarlo per **entrambe** le piattaforme e dismettere il ramo Android fai-da-te.
