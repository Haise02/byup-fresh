# Byup Fresh — Backend Reference
Versione 0.3 — Luglio 2026

Documento di riferimento per lo sviluppo del backend. Risponde a *perché* certe scelte, non solo *cosa* c'è.

> **Status:** Fase 1 MVP (Identity completa) — chiusa e testata end-to-end (curl + suite Jest e2e in `test/`).
> Aggiunte post-Fase 1: password reset, multi-tenant switch, gestione sessioni, rate limiting, modulo devices. Fase 2 (Operational core: orders + bills + payments + kitchen_tickets) da iniziare.

---

## Stack

| Layer | Scelta | Motivazione |
|---|---|---|
| Framework | NestJS 10 + TypeScript | Decoratori IoC allineati al modular monolith, ottimo DX per team piccolo |
| ORM | TypeORM 0.3 | Integrazione nativa NestJS, migrations CLI, entity-as-truth |
| DB | PostgreSQL 16 | ACID garantito, schema relazionale coerente con ERD, upgrade path a read replica |
| Auth | JWT stateless + sessions DB | Access token short-lived (15m), refresh opaco rotante nel DB → revoca immediata |
| 2FA | TOTP via otplib | Standard TOTP, compatibile con qualsiasi authenticator app |
| Infra dev | Docker Compose | Postgres + Redis + app, zero setup locale |

**Pattern architetturale:** modular monolith. Ogni dominio ha modulo NestJS isolato con entities, services, controller, DTOs propri. Nessun import cross-modulo diretto tra service — solo import espliciti via `exports` nel module.

---

## Struttura `src/`

```
src/
├── main.ts                    ← bootstrap, helmet, ValidationPipe, GlobalExceptionFilter
├── app.module.ts              ← root: ConfigModule (globale), ThrottlerModule (rate limit globale), DatabaseModule + moduli dominio
├── config/
│   └── configuration.ts      ← Joi schema + typed config factory
├── database/
│   └── database.module.ts    ← TypeORM async factory da ConfigService
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts   ← @CurrentUser() estrae request.user
│   └── filters/
│       └── http-exception.filter.ts    ← risposta { success, error: { code, message } }
└── modules/
    ├── identity/              ← Modulo 1: tenant + auth staff + collaboration
    │   ├── identity.module.ts
    │   ├── entities/          ← User, Session, UserTwoFa, Restaurant, Role, Membership, Invitation, PasswordReset
    │   ├── auth/              ← register, login, 2FA, refresh, logout, /me, password reset, sessioni, switch-tenant + JwtAuth + OwnerGuard
    │   ├── users/             ← UsersService (lookup by id/email)
    │   └── staff/             ← invitations + memberships management + roles custom
    ├── venue/                 ← Modulo 2: sedi fisiche + orari + impostazioni
    │   ├── venue.module.ts
    │   ├── venue.controller.ts
    │   ├── venue.service.ts
    │   ├── dto/
    │   └── entities/          ← Venue, Room, Table, VenueHours, VenueSettings
    ├── onboarding/            ← Modulo 3: journey post-registrazione
    │   ├── onboarding.module.ts
    │   ├── entities/          ← OnboardingProgress, RestaurantFiscalData
    │   ├── dto/
    │   ├── onboarding.controller.ts
    │   └── onboarding.service.ts
    ├── catalog/               ← Modulo 4: menu, categorie, piatti, allergeni, tag
    │   ├── catalog.module.ts
    │   ├── entities/          ← Menu, MenuCategory, MenuItem, Allergen, Tag, MenuItemAllergen, MenuItemTag
    │   ├── dto/
    │   ├── seeds/             ← seed 14 allergeni UE + 6 tag piattaforma
    │   ├── catalog.controller.ts
    │   └── catalog.service.ts
    └── devices/               ← Modulo 5: dispositivi tablet/KDS/POS + login dispositivo
        ├── devices.module.ts
        ├── entities/          ← Device
        ├── dto/
        ├── strategies/        ← JwtDeviceStrategy (token type='device')
        ├── guards/            ← JwtDeviceGuard
        ├── devices.controller.ts
        └── devices.service.ts
```

---

## Modulo Identity (completato)

### Entities

| Entity | Tabella DB | Note |
|---|---|---|
| `User` | `users` | type: staff/consumer/admin, soft delete `deleted_at` |
| `Session` | `sessions` | token_hash SHA-256, expires_at, revoked_at |
| `UserTwoFa` | `user_2fa` | TOTP secret, recovery codes (json), is_enabled |
| `Restaurant` | `restaurants` | slug unique, platform_status: onboarding/active/churned |
| `Role` | `roles` | is_system (titolare/cameriere/cassa), permissions JSON |
| `Membership` | `memberships` | user ↔ restaurant ↔ role, unique (user_id, restaurant_id) |
| `PasswordReset` | `password_resets` | token_hash SHA-256 unique, expires_at, used_at |

`vat_number` e `legal_name` su `restaurants` sono `nullable` per ora: vengono completati nell'onboarding step 2 (dati fiscali). Allineamento con ERD da fare quando si implementa il modulo onboarding.

### Auth Strategy

**Access token (JWT, 15min):**
```
{ sub: userId, type: 'access', sessionId, restaurantId, role }
```
Firmato con `JWT_ACCESS_SECRET`. Validato da `JwtAccessStrategy` (passport-jwt).

**Refresh token (opaco, 30gg):**
- 48 random bytes → hex string (96 char) consegnato al client
- Hash SHA-256 salvato in `sessions.token_hash`
- Rotazione ad ogni `/auth/refresh`: la sessione vecchia viene revocata, ne viene creata una nuova
- Verifica: trova sessione per hash, controlla `is_active` e `expires_at`

**Token 2FA pending (JWT, 5min):**
```
{ sub: userId, type: '2fa_pending' }
```
Firmato con `JWT_2FA_SECRET` separato. Restituito quando il login riconosce 2FA attiva, prima di completare il flusso.

### Flusso Login con 2FA

```
POST /auth/staff/login
  ↓ password ok, 2FA abilitata
  → { requiresTwoFactor: true, twoFactorToken: <jwt 5min> }

POST /auth/staff/login/2fa
  body: { twoFactorToken, code }
  ↓ verifica JWT pending + TOTP
  → { accessToken, refreshToken, user }
```

### Flusso Register

```
POST /auth/staff/register
  body: { email, password, firstName, lastName, restaurantName, vatNumber? }

In transazione:
  1. Crea User (type='staff')
  2. Crea Restaurant (slug auto-generato, platform_status='onboarding')
  3. Crea 3 ruoli di sistema: titolare / cameriere / cassa
  4. Crea Membership user → restaurant, role=titolare
  5. Crea OnboardingProgress

Dopo il commit: crea Session + emette access+refresh token
(vedi "Lezione presa durante il primo smoke test").

Ritorna: { accessToken, refreshToken, user, restaurant }
```

### Endpoint API (`/api/v1/auth/`)

| Metodo | Path | Guard | Note |
|---|---|---|---|
| `POST` | `staff/register` | — | Crea account + ristorante |
| `POST` | `staff/login` | — | Ritorna token o `requiresTwoFactor` |
| `POST` | `staff/login/2fa` | — | Completa flusso 2FA |
| `POST` | `refresh` | — | Refresh token nel body, rotazione |
| `POST` | `password/forgot` | — | Sempre 200 (non rivela se l'email esiste); `devToken` in dev/MVP |
| `POST` | `password/reset` | — | Consuma il token (hashato in `password_resets`), resetta la password |
| `GET` | `me` | JWT | Profilo + restaurant + role + permessi |
| `GET` | `memberships` | JWT | Ristoranti a cui l'utente appartiene |
| `POST` | `switch-tenant` | JWT | Nuovo access token su un altro ristorante (stessa sessione) |
| `GET` | `sessions` | JWT | Lista sessioni attive (con `isCurrent`) |
| `DELETE` | `sessions/:id` | JWT | Revoca una sessione specifica |
| `DELETE` | `logout` | JWT | Revoca sessione corrente |
| `DELETE` | `logout/all` | JWT | Revoca tutte le sessioni attive |
| `POST` | `2fa/setup` | JWT | Genera secret TOTP + QR data URI |
| `POST` | `2fa/enable` | JWT | Attiva 2FA + genera 8 recovery codes |
| `DELETE` | `2fa/disable` | JWT | Disattiva (richiede password nel body) |

**Rate limiting**: `ThrottlerGuard` globale (60 req/min) via `APP_GUARD`, più `@Throttle` stretto (5 req/min) su register, login, login/2fa e password/forgot. In-memory, senza Redis.

### Risposta standard

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "..." } }
```

---

## Come avviare (sviluppo)

```bash
cd backend

# 1. Solo Postgres
docker compose up postgres -d

# 2. App con hot-reload
npm run start:dev
# → http://localhost:3000/api/v1
```

Con `DB_SYNC=true` TypeORM crea/aggiorna le tabelle automaticamente al boot. In produzione: `DB_SYNC=false` + migrations.

---

## Variabili d'ambiente

Vedi `.env.example`. Quelle obbligatorie:

| Variabile | Note |
|---|---|
| `JWT_ACCESS_SECRET` | min 32 char, mai in Git |
| `JWT_2FA_SECRET` | separato da access, min 32 char |
| `DB_*` | connection params Postgres |

---

## Modulo Onboarding (completato)

Orchestrazione del journey post-registrazione, mappato 1:1 sui 4 step JSX:

| Step | Endpoint | Cosa fa |
|---|---|---|
| 1 | `POST /onboarding/menu` | Salva sorgente menu (photo/pdf/url), avvia AI processing |
| 1 | `GET /onboarding/menu/ai-result` | Polling stato + risultato estrazione |
| 1 | `POST /onboarding/menu/ai-review` | Conferma revisione utente del menu estratto |
| 2a | `PUT /onboarding/locale` | Anagrafica venue + P.IVA + regime fiscale |
| 2b | `POST /onboarding/stripe-connect` | Inizia OAuth Stripe Connect (URL placeholder per ora) |
| 3 | `POST /onboarding/rooms` | Crea sale + tavoli (replace completo, idempotente) |
| 4 | `POST /onboarding/go-live` | Valida e attiva `platform_status='active'` |
| — | `GET /onboarding/status` | Snapshot completo del progress |

### Decisioni chiave

- **`onboarding_progress` creato in transazione di register** — ogni nuovo ristorante nasce con un progress record. Niente race condition tra register e primo accesso onboarding.
- **`updateLocale` è una transazione tri-tabella**: aggiorna `restaurants`, fa upsert di `venues` (sempre uno di default) e di `restaurant_fiscal_data`. Lo step risulta `completed` solo se P.IVA + regime fiscale sono entrambi presenti, altrimenti `in_progress`.
- **`createRooms` è replace, non patch**: ogni POST cancella sale/tavoli esistenti e ricrea da zero. Semantica idempotente, perfetta per il "salva e riprendi" tipico dell'onboarding. Sui tavoli viene generato `qr_token` (UUID) come anticipazione del QR code stampabile.
- **AI processing è mockato con `setTimeout(5s)`** — il job vero sarà SQS → Lambda → Claude API. La response del POST ritorna subito con `stepAiProcessing='processing'`, il client polla `ai-result`.

### Entities aggiunte

- `OnboardingProgress` — singleton per restaurant, 6 step state + dati AI
- `RestaurantFiscalData` — dati fiscali completi (P.IVA, SDI, PEC, IBAN, regime…)
- `Venue`, `Room`, `Table` — modulo `venue` separato, popolato durante onboarding ma riutilizzato da sala/cucina

### Cose ancora da fare (per chiudere onboarding davvero)

- Upload file menu (S3 presigned URL) → ora il `fileKey` arriva già dal client
- Stripe Connect reale: redirect callback + salvare `stripe_connect_account_id` su `restaurants`
- Job AI vero: integrazione Claude API + SQS
- Validazione finale go-live: deve verificare anche che il menu sia stato revisionato

---

## Modulo Staff (completato — chiude Fase 1 MVP)

Gestione team dal titolare: inviti via email, ruoli custom, attivazione/disattivazione membri.

### Endpoint API (`/api/v1/staff/`)

**Pubblici (no JWT — usati dalla pagina di accept):**

| Metodo | Path | Cosa fa |
|---|---|---|
| `GET` | `invitations/verify?token=...` | Preview invito (email, ristorante, ruolo, scadenza) |
| `POST` | `invitations/accept` | Crea User + Membership da invito + password |

**Solo titolare (JWT + `OwnerGuard`):**

| Metodo | Path | Cosa fa |
|---|---|---|
| `POST` | `invitations` | Invita per email + ruolo |
| `GET` | `invitations` | Lista inviti (tutti gli stati) |
| `DELETE` | `invitations/:id` | Revoca invito pending |
| `GET` | `members` | Lista staff del ristorante |
| `PUT` | `members/:id/role` | Cambia ruolo a un membro |
| `DELETE` | `members/:id` | Disattiva membro (soft) |
| `POST` | `roles` | Crea ruolo custom |
| `PUT` | `roles/:id` | Update ruolo (rename + permessi) |
| `DELETE` | `roles/:id` | Elimina ruolo custom |

**Solo JWT (tutti i membri):**

| Metodo | Path | Cosa fa |
|---|---|---|
| `GET` | `roles` | Lista ruoli (system + custom) — utile in form invito |

### Decisioni chiave

- **`OwnerGuard`** — guard dedicato che controlla `jwt.role === 'titolare'`. Da usare DOPO `JwtAuthGuard`. Niente accesso a inviti/membri/ruoli per cameriere e cassa.
- **Token invito**: 32 random bytes hex (64 char), TTL 7 giorni. Salvato in chiaro nella colonna `token` (unique) — non hashato perché serve solo come capability ticket monouso, non come credenziale persistente. In dev viene loggato + restituito nella response del create (TODO: rimuovere dalla response quando SES è collegato).
- **Accept supporta solo nuovi utenti**: se l'email esiste già in `users`, errore con messaggio "accedi e accetta dal pannello". Il flow "accept come utente loggato" è TODO esplicito.
- **Email verification implicita**: chi accetta un invito ha `email_verified=true` automaticamente — l'email è già stata validata dal fatto stesso che ha ricevuto il token.
- **Protezioni anti-lockout** in `ensureNotLastOwner`:
  - Non si può rimuovere il ruolo "titolare" all'ultimo titolare attivo
  - Non si può disattivare l'ultimo titolare
  - Non si può auto-disattivare (`currentUserId === membership.userId` → 400)
  - Non si può auto-degradare da titolare
- **Ruoli custom**: i 3 system roles non si possono rinominare né eliminare; le permissions sì. I custom hanno name in `restaurantId+name` unique, e si possono eliminare solo se non assegnati a memberships attivi.
- **`sanitizePermissions`**: normalizza il body permissions accettando solo le 8 aree note (`panoramica, sala, cucina, app, statistiche, contabilita, supporto, impostazioni`). Tutto il resto viene scartato silenziosamente — coerenza forzata col contratto ERD.

### TODO espliciti

- Integrazione SES per invio email reale (rimuovere `token` dalla create response)
- Flusso "accept come utente loggato" per email già registrate
- Resend invitation (se l'utente non riceve la mail)

---

## Modulo Venue (completato)

Sedi, sale, tavoli, orari, impostazioni operative. Le sale e i tavoli vengono creati durante onboarding step 3; orari e settings sono gestiti post-onboarding dalle Impostazioni.

### Endpoint API (`/api/v1/venue/`)

| Metodo | Path | Cosa fa |
|---|---|---|
| `GET` | `/` | Venue di default del ristorante |
| `GET` | `hours` | Orari settimanali (array 0..6) |
| `PUT` | `hours` | Replace orari completo |
| `GET` | `settings` | `VenueSettings` (lazy create con default se mancante) |
| `PATCH` | `settings` | Update parziale (qualsiasi sottoinsieme di campi) |

### Decisioni chiave

- **VenueSettings è lazy-creato al primo `GET`** con tutti i default ERD (15/25/90 min per warning/alert/overstay, kitchen_mode=`kds`, payment_methods=`[card_terminal, cash]`). Niente migrazione one-shot da scrivere: la prima call li materializza.
- **`PUT /hours` è replace completo**, coerente col pattern già scelto per rooms e item-allergens. Idempotente, validazione anti-duplicati su `dayOfWeek`.
- **`PATCH /settings`** invece è partial: 13 campi opzionali, l'utente cambia solo quelli che gli servono.
- **`day_of_week` 0=lunedì, 6=domenica** (allineato all'ERD italiano, non al JS standard).

---

## Modulo Catalog (completato — core MVP)

CRUD completo di menu/categorie/piatti, allergeni e tag come lookup globali, hook AI→catalog.

### Endpoint API (`/api/v1/catalog/`)

| Metodo | Path | Cosa fa |
|---|---|---|
| `GET` | `allergens` | Lista 14 allergeni UE (seedati) |
| `GET` | `tags` | Lista 6 tag piattaforma (seedati) |
| `GET` | `menus` | Lista menu del ristorante |
| `POST` | `menus` | Crea menu (auto-default se primo) |
| `GET` | `menus/:id` | **Tree completo**: menu → categorie → piatti |
| `PUT` | `menus/:id` | Update (sposta `isDefault` se richiesto) |
| `DELETE` | `menus/:id` | Elimina (non default) |
| `POST` | `menus/:id/categories` | Crea categoria |
| `PUT` | `categories/:id` | Update categoria |
| `DELETE` | `categories/:id` | Cascade su items |
| `GET` | `categories/:id/items` | Lista piatti con allergeni e tag |
| `POST` | `categories/:id/items` | Crea piatto |
| `PUT` | `items/:id` | Update |
| `DELETE` | `items/:id` | Elimina |
| `PUT` | `items/:id/allergens` | Replace set allergeni |
| `PUT` | `items/:id/tags` | Replace set tag |

### Decisioni chiave

- **Allergeni e tag sono lookup globali**, non per-tenant. La lista è fissa (14 UE + 6 piattaforma) e seedata da `CatalogSeedService` con `onApplicationBootstrap` + `upsert` per code/name → idempotente, sicuro a riavvii multipli.
- **Tenant scoping centralizzato**: i metodi privati `requireMenu/requireCategory/requireItem` controllano sempre che la risorsa appartenga al `restaurantId` del JWT. Niente accesso cross-tenant possibile.
- **`PUT /items/:id/allergens` è replace**, non patch: il body è la lista completa degli `allergenIds` voluti. Coerente con il pattern `createRooms` dell'onboarding — semantica idempotente sui set.
- **`MenuItemAllergen` ha `is_ai_suggested` e `is_confirmed`**: l'AI può popolare suggerimenti che il ristoratore conferma esplicitamente. Setting manuale via API → `is_confirmed=true` automaticamente.
- **Cascade su delete**: `MenuCategory` ha `onDelete: 'CASCADE'` verso `Menu`, idem `MenuItem` verso `MenuCategory`. Eliminare una categoria elimina i suoi piatti.

### Hook AI → catalog (orchestrazione onboarding)

`OnboardingService.simulateAiProcessing` ora chiama `CatalogService.createFromAiResult`: quando il mock AI finisce, oltre a salvare il JSON in `onboarding_progress.ai_extraction_result`, popola anche `menus + categories + items` reali. End-to-end completo:

```
POST /onboarding/menu → setTimeout 5s
                     ↓
   createFromAiResult(restaurantId, mock)
                     ↓
   menu default "Menù Principale" + 3 categorie + 7 piatti
                     ↓
   GET /catalog/menus/:id → tree visualizzabile in UI
```

Il client può subito chiamare `GET /catalog/menus` dopo `ai-result === completed` per ottenere il menu reale da mostrare in step 4.

---

## Modulo Devices (completato)

Dispositivi fisici del locale (tablet, KDS, terminale POS) legati alla venue di default. Solo i KDS hanno credenziali locali.

### Endpoint API (`/api/v1/devices/`)

| Metodo | Path | Guard | Cosa fa |
|---|---|---|---|
| `POST` | `login` | — | Login dispositivo KDS (username + password) → JWT device |
| `GET` | `/` | JWT + Owner | Lista dispositivi del ristorante |
| `POST` | `/` | JWT + Owner | Crea dispositivo (per i KDS genera username + password one-shot) |
| `PUT` | `:id` | JWT + Owner | Update (nome, modello, attivo) |
| `POST` | `:id/regenerate-password` | JWT + Owner | Rigenera password (solo KDS, invalida la vecchia) |
| `DELETE` | `:id` | JWT + Owner | Elimina dispositivo |

### Decisioni chiave

- **Token device separato dal token staff**: JWT con `type='device'` + `scope` per tipo (`kitchen:*` per KDS, `orders`/`payments` per POS, `orders` per tablet), TTL 365 giorni, validato da `JwtDeviceStrategy` (passport `jwt-device`). Firmato con lo stesso `JWT_ACCESS_SECRET`: la discriminazione avviene sul claim `type`.
- **Username KDS auto-generato** (es. `PG1-cucina`: prefisso venue + sequenza + nome device) con password random 12 char, restituita solo nella response del create/regenerate — dopo esiste solo l'hash bcrypt.
- `Device` è legato alla `Venue` con `onDelete: CASCADE`; `assigned_operator` (nullable) è per i POS, associato al primo login.

---

## Moduli da costruire (backlog)

Priorità suggerita basata su dipendenze operative:

| Modulo | Dipende da | Contenuto |
|---|---|---|
| **catalog v2** | catalog | `option_groups`, `option_values`, ingredients, nutrition, media upload S3 |
| **sala** | catalog + venue | `orders`, `order_items`, `bills`, `table_guests`, `reservations` |
| **cucina** | sala | `kitchen_tickets`, `kitchen_ticket_items` |
| **payments** | sala | `payments`, `payment_locks`, `fiscal_documents`, `refunds` |
| **billing** | identity | `plans`, `subscriptions`, `order_packs`, platform invoices |
| **notifications** | tutti | `notifications`, push tokens, websocket |
| **analytics** | sala + payments | KPI, statistiche, report |
| **backoffice** | tutti | admin panel (tenant mgmt, supporto, commercial) |

**Prossimo step consigliato:** modulo `sala` (orders + bills) — apre la Fase 2 operational core.

---

## Lezione presa durante il primo smoke test (Maggio 2026)

**Problema:** la prima `POST /auth/staff/register` falliva con FK violation su `sessions.user_id`. Causa: `SessionsService.create()` usa il suo repository iniettato (connessione separata), mentre il register avveniva dentro `dataSource.transaction()`. L'INSERT su sessions partiva su una connessione che non vedeva ancora lo user committato.

**Fix:** la transazione di register ora include solo le tabelle relazionate (user, restaurant, roles, membership, onboarding_progress). La creazione di session + token avviene **dopo il commit**, fuori dal callback `transaction`. Questa è una regola generale: un repository iniettato fuori dall'EntityManager della transazione non è transactional. O passi sempre `em` ai service collaboratori, o committi prima.

**Bug 2 (stesso smoke test):** `PUT /onboarding/locale` restituiva 500 con `EntityMetadataNotFoundError: No metadata for "RestaurantFiscalData" was found`. Era usata solo via `em.findOne(RestaurantFiscalData, …)` dentro la transazione, e nessun `TypeOrmModule.forFeature` la includeva. `autoLoadEntities: true` da solo NON registra l'entity nel metadata registry: serve almeno un `forFeature` da qualche modulo. **Lezione:** ogni entity decorata con `@Entity` deve apparire in almeno un `forFeature`, anche se usata solo via EntityManager. Il commento "non serve forFeature, la trova autoLoadEntities" era sbagliato — corretto in `onboarding.module.ts`.

**End-to-end test (Maggio 2026):** 22 step + 8 edge cases verificati con curl, sequenza completa register → onboarding → catalog AI hook → venue → staff invite/accept → go-live → ristorante `platform_status='active'`. Tenant isolation verificata (un titolare non può leggere il menu di un altro ristorante → 403). Validation Pipe whitelist attiva (campi sconosciuti → 400).

**Suite Jest e2e** (`npm run test:e2e`, config `jest-e2e.json`) in `test/`: `auth.e2e-spec` più sezioni A (input malformati), B (concorrenza), C (token/temporale). Smoke funzionale ripetibile in `scripts/phase1-functional-check.sh`.

---

## Decisioni da rivedere / TODO tecnici

- Email verification flow — `email_verified` è in DB, il flusso di invio email non è implementato
- Rimuovere `devToken` dalla response di `POST /auth/password/forgot` quando l'invio email (SES) è collegato
- Rate limiting: oggi in-memory (`@nestjs/throttler`); valutare storage Redis quando si scala su più istanze
- `user_social_logins` — entity non creata (OAuth Google/Apple, out of scope MVP staff)
- Migration files per produzione — attualmente `DB_SYNC=true` in dev

Fatti rispetto alla v0.2: rate limiting su login/register (throttler), `onboarding_progress` (modulo onboarding), `invitations` (modulo staff), `devices` (modulo devices), `GET /auth/me` esposto.
