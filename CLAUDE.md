# CLAUDE.md — Byup (root del monorepo)

## Cosa è questo repo
Prototipo UX/UI dell'ecosistema Byup, servito statico (HTML + React via Babel-standalone, nessuna build). Mostra come si presentano e si usano le schermate. Non è la specifica del sistema: i dati sono finti e le logiche interne servono solo a rendere credibili le schermate. Meccanica del repo (deploy, cache-buster, struttura): `README.md`.

## Dove sta la verità
Prodotto e flussi: i tre documenti ufficiali — Scheda del Database, Specifica dei Flussi Applicativi, Documento di Progettazione Tecnica. Modello dati: `backend/erd/` (DBML + riferimento enum). Contesto verificato del gestionale, listino incluso: `gestionale/CLAUDE.md` (fonte del listino: `ACC_PIANI` in `gestionale/account-data.jsx`; Hubble lo replica in `hubble/admin-data.jsx` e in caso di divergenza vince il gestionale). Prodotto app consumer: `app/Contesto-App.md` e collegati. Stato del lavoro: `gestionale/PROGRESS.md`.
Regola: se documento e codice divergono su com'è fatto il prototipo vince il codice; se divergono su cosa deve fare il prodotto vince il documento.

## Decisioni chiuse (non riaprire senza accordo esplicito)
Esiste un solo prodotto, Byup Fresh; Byup Manager non esiste. Quattro piani (Gratuito, Starter, Plus, Business) a transazioni pesate: il listino vive solo nei file indicati sopra, mai qui. Il peso segue la superficie di pagamento: 0,5 se si salda in app, 1,0 altrimenti. Architettura full cloud su AWS, nessun componente locale, mai. Stampa cucina solo browser/KDS, niente stampanti termiche né Epson ePOS SDK; l'unica stampa è lo scontrino di cortesia. Fiscale via OpenAPI. Pagamenti via Stripe (Connect, Terminal/Tap to Pay, Billing). La console interna si chiama Hubble (ex Spot).

## Come lavorare con Fabio
Iterativo e diretto: un punto alla volta, chiuso prima di aprirne un altro. Risposte concise e descrittive, mai bullet point. Testo esatto copia-incollabile, non descrizioni di modifiche. Nuova feature: la domanda di default è «core MVP o deferita?», e il default è deferire. Documenti italiani in italiano.
