# byup — WebApp consumer

> ⚠️ **Leggi sempre per primo il contesto del prodotto** prima di lavorare in questo repo.
> È la fonte di verità su cosa la webapp fa, cosa **non** fa di proposito, flussi e contratto dati.

@Contesto-WebApp.md

---

## Promemoria operativi rapidi

- **Scopo unico della webapp: ordinare AL TAVOLO.** Niente pagamento in-app, niente discovery, niente account.
- **Non implementare** (di proposito): pagamento/Stripe, discovery (home/mappa/vetrine/Posta), login/registrazione, **geofence/GPS**.
- Il pagamento avviene **in cassa** (App Staff) o dall'app. Il recupero dell'ordine webapp→app è via **codice ordine + install referrer + banner** (vedi `byup-spec-tecnica-recupero-ordine.md`), non più "telefono + SMS".
- **Asporto da webapp: deciso SÌ (D-14), realizzato (P-01 · P-02).** L'ordine d'asporto si compone dal browser e si salda **in cassa oppure in app**, recuperandolo col codice mostrato dalla webapp (popup in stile OTP con riconoscimento all'incollaggio; su Android aggancio automatico via Install Referrer — SFA §3.8); le due strade a pari evidenza (P-02). Oggi il QR (`?takeaway=1`) mostra ancora la schermata di download (`TakeawayRedirect` in `menu.jsx`), da sostituire con l'ordinazione. Razionale in `Contesto-WebApp.md` §2.2.
- **Niente geofence/GPS.** Scartato come difesa (falsificabile, fa scappare l'utente onesto): la protezione è **gate di sessione + rate limiting + pagamento contestuale**, lato backend. Vedi `byup-punto3-difesa-attacchi.md`.
- **Divisione del conto: feature real-time anche da webapp** (selezione righe, dividi un piatto, offri). L'**unico limite è il pagamento**, che da webapp non si fa.
- Tutte le chiamate al backend passano da **`window.ByupAPI`** (`api.jsx`), oggi **mock**. Contratto completo in `byup-contratto-backend-webapp.md`.
- Partecipante webapp nella sessione tavolo = flag `isWebApp`.
- File principali: `api.jsx`, `menu.jsx`, `venue.jsx`, `dish-art.jsx`, `index.html`, `simulator.html`.
- Documenti di prodotto recenti (decisioni): `byup-punto3-difesa-attacchi.md`, `byup-punto4-pagamenti-divisione.md`, `byup-spec-tecnica-recupero-ordine.md`, `byup-contratto-backend-webapp.md`. (L'asporto, ex `punto2`, è ora in `Contesto-WebApp.md` §2.2.)
