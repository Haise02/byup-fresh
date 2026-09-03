# Byup Fresh — Riferimento valori e stati del database
# Versione 0.7 — Maggio 2026
# Enforcement: ENUM per valori immutabili, CHECK per stati, calcolato per derivati.

## NUCLEO OPERATIVO

### orders.channel [ENUM]
- sala
- vendita_diretta
- asporto_app

### orders.source_surface [ENUM]
- staff_web
- webapp_guest
- byup_app

### orders.delivery_mode [CHECK — solo per vendita_diretta]
- bancone
- asporto

### orders.status [CHECK]
- created
- pending_validation
- confirmed
- sent_to_kitchen
- in_preparation
- ready
- served
- bill_open
- paid
- fiscally_closed
- fiscally_failed
- canceled

### orders.weight [calcolato da source_surface]
- 1.0 → staff_web, webapp_guest, vendita_diretta
- 0.5 → byup_app

### orders.note_type [CHECK — nullable]
- compleanno
- allergia
- bambini
- aziendale
- custom

### order_items.vat_category [ENUM]
- prepared_on_site
- packaged_product

### order_items.effective_vat_rate [calcolato]
- 10 → somministrazione per tutti, asporto per prepared_on_site
- 22 → asporto per packaged_product

### order_items.preparation_status [CHECK]
- pending
- sent_to_kitchen
- in_preparation
- ready
- served

### order_item_assignments.assignment_type [ENUM]
- self
- guest
- table

### order_item_assignments.status [CHECK]
- assigned
- rejected
- paid

### kitchen_tickets.status [CHECK — calcolato dal backend, persistito]
- queued
- in_preparation
- ready
- canceled

### kitchen_ticket_items.status [CHECK]
- queued
- in_preparation
- ready
- canceled

### kitchen_ticket_items.course_number [CHECK — nullable]
- 1 → antipasto
- 2 → primo
- 3 → secondo
- 4 → dessert
- NULL → portata unica / non sequenziato

### tables.status [CHECK]
- free
- occupied
- reserved
- to_clean

### bills.bill_type [ENUM]
- full
- split

### bills.adjustment_type [CHECK — nullable]
- discount_pct
- discount_eur
- round_down

### bills.status [CHECK]
- open
- payment_in_progress
- paid
- fiscally_pending
- fiscally_closed
- fiscally_failed

### payments.method [ENUM]
- card_terminal
- in_app
- cash

### payments.status [CHECK]
- pending
- processing
- confirmed
- failed
- refunded
- partially_refunded

### payment_locks.locked_by_type [ENUM]
- consumer
- staff

### fiscal_documents.doc_type [ENUM]
- corrispettivo
- fattura_elettronica

### fiscal_documents.transmission_status [CHECK]
- pending
- sent
- accepted
- rejected
- error

### refunds.refund_type [ENUM]
- full
- partial

### refunds.method [ENUM]
- stripe_refund
- cash_refund

### refunds.status [CHECK]
- pending
- processed
- failed

### refunds.initiated_from [ENUM]
- gestionale
- backoffice

### table_guests.status [CHECK]
- active
- left
- paid


## TENANT E IDENTITA

### restaurants.platform_status [CHECK]
- onboarding
- active
- churned

### restaurants.stripe_connect_status [CHECK]
- pending
- active
- restricted
- disabled

### users.type [ENUM]
- staff
- consumer
- admin

### user_social_logins.provider [ENUM]
- google
- apple

### roles.is_system [boolean]
- true → titolare, cameriere, cassa — non modificabili
- false → ruolo custom del ristoratore

### roles.permissions [JSON — aree funzionali]
- panoramica
- sala
- cucina
- app
- statistiche
- contabilita
- supporto
- impostazioni

### invitations.status [CHECK]
- pending
- accepted
- expired
- revoked

### devices.type [ENUM]
- tablet
- kds
- pos_terminal

### venue_settings.kitchen_mode [ENUM]
- kds
- printer
- both

### onboarding_progress.step_* [CHECK]
- pending
- in_progress
- processing (solo step_ai_processing)
- completed
- failed (solo step_ai_processing)

### restaurant_fiscal_data.regime_fiscale [CHECK]
- ordinario
- forfettario
- semplificato

### restaurant_fiscal_data.openapi_channel_status [CHECK]
- active
- suspended
- error

### admin_roles.name [valori predefiniti]
- superadmin
- support
- commercial
- marketing


## CATALOGO

### option_groups.selection_type [ENUM]
- single
- multiple

### allergens.code [tabella di riferimento — 14 allergeni UE]
- gluten
- crustaceans
- eggs
- fish
- peanuts
- soybeans
- milk
- nuts
- celery
- mustard
- sesame
- sulphites
- lupin
- molluscs

### tags.name [tabella di riferimento — predefiniti da Byup]
- senza_glutine
- vegano
- vegetariano
- bio
- piccante
- senza_lattosio

### media.entity_type [ENUM]
- menu_item
- category
- venue
- restaurant


## BILLING E SECONDARIE

### plans.name [ENUM]
- free
- starter
- plus
- business

### plans.support_tier [ENUM]
- basic → chat bot, tutorial, ticket email (Gratuito e Starter)
- phone_business_hours → + telefonico lun-ven, fasce 12-16 e 18-22, richiamata entro 2 ore (Plus)
- phone_24h → + telefonico H24, 7 su 7, richiamata entro 1 ora, canale prioritario (Business)

Nota (P-66 · D-59): i valori sono corretti sul livello di assistenza deciso;
il nome del valore intermedio (`phone_business_hours`) è proposto qui e va
confermato sull'ERD v11. Prima `phone_24h` era attribuito a Plus con richiamata
entro 30 minuti, più di quanto dato a Business.

### plans.max_menus [int nullable]
- 1 → Gratuito
- 3 → Starter
- NULL → Plus e Business

### plans.max_staff_members [int nullable — conteggio combinato con devices nell'MVP]
- 1 → Gratuito
- 3 → Starter
- NULL → Plus e Business

### plans.max_devices [int nullable — conteggio combinato con staff nell'MVP]
- 1 → Gratuito
- 3 → Starter
- NULL → Plus e Business

### add_ons.name [predisposti, non attivi nell'MVP]
- delivery_integration → 10 EUR/mese + IVA
- api_third_party → 22.90 EUR/mese + IVA

### subscriptions.activation_mode [ENUM]
- stripe_billing
- manual_backoffice

### subscriptions.status [CHECK]
- active
- past_due
- canceled
- suspended

### subscription_add_ons.status [CHECK]
- active
- canceled

### subscription_changes.change_type [ENUM]
- upgrade
- downgrade
- cancel

### order_packs.status [CHECK]
- active
- exhausted
- expired

### platform_invoices.invoice_type [ENUM]
- subscription_recurring
- extra_transactions

### platform_invoices.status [CHECK]
- pending
- paid
- failed
- voided

### cost_entries.category [CHECK]
- affitti
- personale
- materie
- servizi
- altro

### cost_entries.recurrence_type [ENUM]
- one_off
- weekly
- biweekly
- monthly
- bimonthly
- quarterly
- annual

### cost_entries.status [CHECK]
- paid
- due
- overdue

### cash_register_sessions.status [ENUM]
- open
- closed

### reservations.status [CHECK]
- confirmed
- arrived
- completed
- no_show
- canceled

### reservations.source [ENUM]
- staff (solo nell'MVP)

### notifications.channel [ENUM]
- push
- email
- in_app
- websocket

### notifications.category [CHECK]
- order_update
- payment_result
- kitchen_ready
- onboarding
- system

### notifications.delivery_status [CHECK]
- pending
- sent
- delivered
- failed

### feed_posts.post_type [CHECK]
- news
- promotion

### reviews.rating [CHECK]
- 1, 2, 3, 4, 5

### support_tickets.status [CHECK]
- open
- in_progress
- resolved
- closed

### support_tickets.priority [CHECK]
- low
- normal
- high
- urgent

### support_tickets.category [CHECK]
- bug
- assistance
- feedback
- feature_request

### push_device_tokens.platform [ENUM]
- ios
- android

### venue_profiles.venue_category [CHECK]
- ristorante
- pizzeria
- cocktail_bar
- pub
- hamburgeria
- bistrot
- gelateria
- gastronomia
- food_truck
- pasticceria

### venue_profiles.price_range [CHECK]
- budget
- moderate
- premium


## PATTERN TRASVERSALI

### Soft delete GDPR [deleted_at timestamp nullable]
Presente su: users, consumer_profiles, consumer_favorites,
consumer_payment_methods, reviews, table_guests.

### Consent tracking GDPR [consent_data JSON su consumer_profiles]
Struttura: {"marketing": {"granted": true, "at": "2026-01-15T10:00:00Z"},
            "profiling": {"granted": false},
            "data_sharing": {"granted": true, "at": "2026-01-15T10:00:00Z"}}

### Consumer filtering
allergen_alerts (JSON su consumer_profiles): codici allergeni da escludere dalla visualizzazione menu.
dietary_preferences (JSON su consumer_profiles): nomi tag da promuovere in cima al menu senza esclusione.
