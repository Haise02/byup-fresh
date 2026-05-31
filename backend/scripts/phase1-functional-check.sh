#!/usr/bin/env bash
# Verifica funzionale Fase 1 Byup via HTTP contro il server attivo (porta 3000).
#
# A COSA SERVE: esegue ~74 flussi (auth, 2FA, onboarding end-to-end, catalog,
# venue, staff/ruoli/inviti/membri, RBAC, devices) con curl e stampa PASS/FAIL +
# conteggio finale. È la riesecuzione automatizzata della checklist funzionale.
#
# PREREQUISITI:
#   1. App in esecuzione su http://localhost:3000 (es. `docker compose up -d app`
#      da backend/ — gira con hot-reload).
#   2. python3 nel PATH (parsing JSON + calcolo dei codici TOTP del 2FA).
#
# NOTE:
#   - Richieste spaziate ~1.1s per non sforare il throttler REALE attivo (5
#     login/register al minuto, 60 req/min globali). Nessun override: si
#     interroga l'app così com'è.
#   - Email/P.IVA uniche per run (timestamp) → ri-eseguibile su DB già popolato.
#   - Perché curl e non jest: l'harness Claude Code non carica gli addon nativi
#     (.node) → jest/bcrypt KO nel suo processo; curl è out-of-process e il
#     server gira in Docker, quindi questa verifica È eseguibile dall'assistente.
#
# USO:  bash scripts/phase1-functional-check.sh
BASE=http://localhost:3000/api/v1
PASS=0; FAIL=0; N=0
FAILED=()
TS=$(date +%s)
OWNER_EMAIL="owner-$TS@byup.test"; OWNER_PW="OwnerPwd123!"
INV_EMAIL="invitee-$TS@byup.test"; INV_PW="InviteePwd456!"
INV2_EMAIL="invitee2-$TS@byup.test"
OWNER_VAT=$(printf '%011d' $((TS % 100000000000)))   # P.IVA 11 cifre, unica per run
HTTP=""; BODY=""

pause(){ sleep 1.1; }

# req METHOD PATH TOKEN BODY
req(){
  local m=$1 p=$2 tok=$3 body=$4
  local a=(-s -o /tmp/bk_body -w "%{http_code}" -X "$m" "$BASE$p" -H "Content-Type: application/json")
  [ -n "$tok" ] && a+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && a+=(-d "$body")
  HTTP=$(curl "${a[@]}")
  BODY=$(cat /tmp/bk_body)
  pause
}
# req con content-type custom (per test no-json non serve qui)
jget(){ python3 -c 'import sys,json
try:
 d=json.load(sys.stdin); print(eval("d"+sys.argv[1]))
except Exception: print("")' "$1"; }
totp(){ python3 -c 'import sys,hmac,hashlib,base64,struct,time
s=sys.argv[1]; k=base64.b32decode(s+"="*((8-len(s)%8)%8),casefold=True)
c=int(time.time())//30; h=hmac.new(k,struct.pack(">Q",c),hashlib.sha1).digest()
o=h[19]&15; print("%06d"%((struct.unpack(">I",h[o:o+4])[0]&0x7fffffff)%1000000))' "$1"; }

check(){ # check "desc" expected
  N=$((N+1))
  if [ "$HTTP" = "$2" ]; then PASS=$((PASS+1)); printf "PASS  %2d. %s (%s)\n" "$N" "$1" "$HTTP"
  else FAIL=$((FAIL+1)); FAILED+=("$N. $1 [atteso $2, ottenuto $HTTP] $(echo "$BODY"|head -c140)"); printf "FAIL  %2d. %s (atteso %s, ottenuto %s)\n" "$N" "$1" "$2" "$HTTP"; fi
}

echo "===== AUTH ====="
req POST /auth/staff/register "" "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PW\",\"firstName\":\"Mario\",\"lastName\":\"Rossi\",\"restaurantName\":\"Cacio e Pepe\"}"
check "register titolare (201 + token)" 201
ATOKEN=$(jget '["data"]["accessToken"]' <<<"$BODY")
RTOKEN=$(jget '["data"]["refreshToken"]' <<<"$BODY")
RESTID=$(jget '["data"]["restaurant"]["id"]' <<<"$BODY")

req POST /auth/staff/register "" "{\"email\":\"$OWNER_EMAIL\",\"password\":\"Diff123456!\",\"firstName\":\"X\",\"lastName\":\"Y\",\"restaurantName\":\"Altro\"}"
check "register email duplicata -> 409" 409

req GET /auth/me "$ATOKEN" ""
check "me con token -> 200" 200
ROLE=$(jget '["data"]["role"]' <<<"$BODY"); [ "$ROLE" = "titolare" ] || FAILED+=("me role atteso titolare, era $ROLE")

req GET /auth/me "" ""
check "me senza token -> 401" 401

req POST /auth/staff/login "" "{\"email\":\"$OWNER_EMAIL\",\"password\":\"WRONG\"}"
check "login password errata -> 401" 401

req POST /auth/staff/login "" "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PW\"}"
check "login corretto -> 200" 200
LREFRESH=$(jget '["data"]["refreshToken"]' <<<"$BODY")
LTOKEN=$(jget '["data"]["accessToken"]' <<<"$BODY")

req POST /auth/refresh "" "{\"refreshToken\":\"$LREFRESH\"}"
check "refresh -> 200 (rotazione)" 200
LREFRESH2=$(jget '["data"]["refreshToken"]' <<<"$BODY")
LTOKEN2=$(jget '["data"]["accessToken"]' <<<"$BODY")   # access della sessione attiva post-refresh

req POST /auth/refresh "" "{\"refreshToken\":\"$LREFRESH\"}"
check "refresh con token ruotato -> 401" 401

# Logout sulla sessione ANCORA attiva (quella ruotata dal refresh), non su LTOKEN
# (la cui sessione è già stata revocata dalla rotazione).
req DELETE /auth/logout "$LTOKEN2" ""
check "logout -> 200" 200
req GET /auth/me "$LTOKEN2" ""
check "me dopo logout (sessione revocata) -> 401" 401

echo "===== 2FA ====="
req POST /auth/2fa/setup "$ATOKEN" ""
check "2fa/setup -> 201 + secret" 201
SECRET=$(jget '["data"]["secret"]' <<<"$BODY")
req POST /auth/2fa/enable "$ATOKEN" "{\"code\":\"$(totp "$SECRET")\"}"
check "2fa/enable (codice valido) -> 201" 201
req POST /auth/staff/login "" "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PW\"}"
check "login con 2FA attiva -> 200 requiresTwoFactor" 200
TFT=$(jget '["data"]["twoFactorToken"]' <<<"$BODY")
REQ2FA=$(jget '["data"]["requiresTwoFactor"]' <<<"$BODY"); [ "$REQ2FA" = "True" ] || FAILED+=("login 2FA: requiresTwoFactor atteso true, era $REQ2FA")
req POST /auth/staff/login/2fa "" "{\"twoFactorToken\":\"$TFT\",\"code\":\"000000\"}"
check "login/2fa codice errato -> 401" 401
req POST /auth/staff/login/2fa "" "{\"twoFactorToken\":\"$TFT\",\"code\":\"$(totp "$SECRET")\"}"
check "login/2fa codice valido -> 200" 200
req DELETE /auth/2fa/disable "$ATOKEN" "{\"password\":\"$OWNER_PW\"}"
check "2fa/disable -> 200" 200

echo "===== ONBOARDING ====="
req GET /onboarding/status "$ATOKEN" ""
check "onboarding/status -> 200" 200
req POST /onboarding/menu "$ATOKEN" "{\"sourceType\":\"url\",\"sourceUrl\":\"https://example.com/menu\"}"
N=$((N+1)); if [ "$HTTP" = "200" ]||[ "$HTTP" = "201" ]; then PASS=$((PASS+1)); printf "PASS  %2d. onboarding/menu (avvia AI) -> 2xx (%s)\n" "$N" "$HTTP"; else FAIL=$((FAIL+1)); FAILED+=("$N. onboarding/menu [$HTTP] $(echo "$BODY"|head -c120)"); printf "FAIL  %2d. onboarding/menu (%s)\n" "$N" "$HTTP"; fi
echo "    (attendo 6s il mock AI...)"; sleep 6
req GET /onboarding/menu/ai-result "$ATOKEN" ""
check "onboarding/menu/ai-result -> 200" 200
req POST /onboarding/menu/ai-review "$ATOKEN" ""
AI_REVIEW=$HTTP; N=$((N+1)); if [ "$HTTP" = "200" ]||[ "$HTTP" = "201" ]; then PASS=$((PASS+1)); printf "PASS  %2d. %s (%s)\n" "$N" "onboarding/menu/ai-review -> 2xx" "$HTTP"; else FAIL=$((FAIL+1)); FAILED+=("$N. ai-review [$HTTP]"); printf "FAIL  %2d. ai-review (%s)\n" "$N" "$HTTP"; fi
req PUT /onboarding/locale "$ATOKEN" "{\"name\":\"Cacio e Pepe\",\"vatNumber\":\"$OWNER_VAT\",\"addressStreet\":\"Via dei Giubbonari 27\",\"addressCity\":\"Roma\",\"addressProvince\":\"RM\",\"addressZip\":\"00186\",\"phone\":\"06 1234 5678\",\"regimeFiscale\":\"ordinario\"}"
check "onboarding/locale -> 200" 200
req POST /onboarding/stripe-connect "$ATOKEN" ""
N=$((N+1)); if [ "$HTTP" = "200" ]||[ "$HTTP" = "201" ]; then PASS=$((PASS+1)); printf "PASS  %2d. stripe-connect -> 2xx (%s)\n" "$N" "$HTTP"; else FAIL=$((FAIL+1)); FAILED+=("$N. stripe-connect [$HTTP]"); printf "FAIL  %2d. stripe-connect (%s)\n" "$N" "$HTTP"; fi
req POST /onboarding/rooms "$ATOKEN" "{\"rooms\":[{\"name\":\"Sala interna\",\"tables\":12,\"isDefault\":true},{\"name\":\"Dehors\",\"tables\":6}]}"
N=$((N+1)); if [ "$HTTP" = "200" ]||[ "$HTTP" = "201" ]; then PASS=$((PASS+1)); printf "PASS  %2d. onboarding/rooms -> 2xx (%s)\n" "$N" "$HTTP"; else FAIL=$((FAIL+1)); FAILED+=("$N. rooms [$HTTP] $(echo "$BODY"|head -c120)"); printf "FAIL  %2d. onboarding/rooms (%s)\n" "$N" "$HTTP"; fi
req POST /onboarding/go-live "$ATOKEN" ""
N=$((N+1)); if [ "$HTTP" = "200" ]||[ "$HTTP" = "201" ]; then PASS=$((PASS+1)); printf "PASS  %2d. onboarding/go-live -> 2xx (%s)\n" "$N" "$HTTP"; else FAIL=$((FAIL+1)); FAILED+=("$N. go-live [$HTTP] $(echo "$BODY"|head -c120)"); printf "FAIL  %2d. onboarding/go-live (%s)\n" "$N" "$HTTP"; fi

echo "===== CATALOG ====="
req GET /catalog/allergens "$ATOKEN" ""
check "catalog/allergens -> 200" 200
NALL=$(jget 'len(["data"])' <<<"$BODY" 2>/dev/null); FIRST_ALL=$(jget '["data"][0]["id"]' <<<"$BODY")
req GET /catalog/tags "$ATOKEN" ""
check "catalog/tags -> 200" 200
FIRST_TAG=$(jget '["data"][0]["id"]' <<<"$BODY")
req GET /catalog/menus "$ATOKEN" ""
check "catalog/menus -> 200 (menu AI)" 200
MENUID=$(jget '["data"][0]["id"]' <<<"$BODY")
req GET "/catalog/menus/$MENUID" "$ATOKEN" ""
check "catalog/menus/:id tree -> 200" 200
req POST /catalog/menus "$ATOKEN" "{\"name\":\"Menu Pranzo\",\"isDefault\":false,\"displayOrder\":1}"
check "POST catalog/menus -> 201" 201
EXTRA_MENU=$(jget '["data"]["id"]' <<<"$BODY")
req PUT "/catalog/menus/$EXTRA_MENU" "$ATOKEN" "{\"name\":\"Menu Pranzo LV\",\"isActive\":true}"
check "PUT catalog/menus/:id -> 200" 200
req DELETE "/catalog/menus/$EXTRA_MENU" "$ATOKEN" ""
check "DELETE catalog/menus/:id -> 200" 200
req POST "/catalog/menus/$MENUID/categories" "$ATOKEN" "{\"name\":\"Pizze\",\"description\":\"Lievitazione lunga\",\"displayOrder\":3}"
check "POST categoria -> 201" 201
CATID=$(jget '["data"]["id"]' <<<"$BODY")
req PUT "/catalog/categories/$CATID" "$ATOKEN" "{\"name\":\"Pizze classiche\"}"
check "PUT categoria -> 200" 200
req GET "/catalog/categories/$CATID/items" "$ATOKEN" ""
check "GET items della categoria -> 200" 200
req POST "/catalog/categories/$CATID/items" "$ATOKEN" "{\"name\":\"Tagliolini al tartufo\",\"description\":\"Pasta fresca\",\"price\":22.00,\"foodCost\":8.50,\"vatCategory\":\"prepared_on_site\",\"prepTimeMinutes\":12,\"displayOrder\":10}"
check "POST piatto -> 201" 201
ITEMID=$(jget '["data"]["id"]' <<<"$BODY")
req PUT "/catalog/items/$ITEMID" "$ATOKEN" "{\"price\":24.00,\"isAvailable\":true}"
check "PUT piatto -> 200" 200
req PUT "/catalog/items/$ITEMID/allergens" "$ATOKEN" "{\"allergenIds\":[\"$FIRST_ALL\"]}"
check "PUT allergeni piatto -> 200" 200
req PUT "/catalog/items/$ITEMID/tags" "$ATOKEN" "{\"tagIds\":[\"$FIRST_TAG\"]}"
check "PUT tag piatto -> 200" 200
req DELETE "/catalog/items/$ITEMID" "$ATOKEN" ""
check "DELETE piatto -> 200" 200
req DELETE "/catalog/categories/$CATID" "$ATOKEN" ""
check "DELETE categoria -> 200" 200

echo "===== VENUE ====="
req GET /venue "$ATOKEN" ""
check "GET /venue -> 200" 200
req GET /venue/hours "$ATOKEN" ""
check "GET /venue/hours -> 200" 200
req PUT /venue/hours "$ATOKEN" "{\"hours\":[{\"dayOfWeek\":0,\"openTime\":\"12:00\",\"closeTime\":\"23:00\",\"isClosed\":false},{\"dayOfWeek\":1,\"openTime\":\"12:00\",\"closeTime\":\"23:00\",\"isClosed\":false},{\"dayOfWeek\":2,\"openTime\":\"12:00\",\"closeTime\":\"23:00\",\"isClosed\":false},{\"dayOfWeek\":3,\"openTime\":\"12:00\",\"closeTime\":\"23:00\",\"isClosed\":false},{\"dayOfWeek\":4,\"openTime\":\"12:00\",\"closeTime\":\"00:30\",\"isClosed\":false},{\"dayOfWeek\":5,\"openTime\":\"12:00\",\"closeTime\":\"00:30\",\"isClosed\":false},{\"dayOfWeek\":6,\"openTime\":\"12:00\",\"closeTime\":\"23:00\",\"isClosed\":false}]}"
check "PUT /venue/hours -> 200" 200
req GET /venue/settings "$ATOKEN" ""
check "GET /venue/settings (lazy-create) -> 200" 200
req PATCH /venue/settings "$ATOKEN" "{\"kitchenMode\":\"both\",\"serviceChargeEnabled\":true,\"serviceChargePercentage\":10,\"overstayMin\":120,\"paymentMethodsEnabled\":[\"card_terminal\",\"in_app\",\"cash\"]}"
check "PATCH /venue/settings -> 200" 200

echo "===== STAFF ROLES ====="
req GET /staff/roles "$ATOKEN" ""
check "GET /staff/roles -> 200" 200
CAM_ROLE=$(python3 -c 'import sys,json;d=json.load(sys.stdin);r=[x for x in d["data"] if x["name"]!="titolare"];print(r[0]["id"] if r else "")' <<<"$BODY")
CASSA_ROLE=$(python3 -c 'import sys,json;d=json.load(sys.stdin);r=[x for x in d["data"] if x["name"]!="titolare"];print(r[1]["id"] if len(r)>1 else r[0]["id"])' <<<"$BODY")
req POST /staff/roles "$ATOKEN" "{\"name\":\"barista\",\"permissions\":{\"panoramica\":false,\"sala\":true,\"cucina\":false,\"app\":true,\"statistiche\":false,\"contabilita\":false,\"supporto\":true,\"impostazioni\":false}}"
check "POST /staff/roles custom -> 201" 201
CUSTOM_ROLE=$(jget '["data"]["id"]' <<<"$BODY")
req PUT "/staff/roles/$CUSTOM_ROLE" "$ATOKEN" "{\"name\":\"barista-capo\"}"
check "PUT /staff/roles/:id -> 200" 200
req DELETE "/staff/roles/$CUSTOM_ROLE" "$ATOKEN" ""
check "DELETE /staff/roles/:id -> 200" 200

echo "===== INVITATIONS ====="
req POST /staff/invitations "$ATOKEN" "{\"email\":\"$INV_EMAIL\",\"roleId\":\"$CAM_ROLE\"}"
check "POST /staff/invitations -> 201" 201
INV_ID=$(jget '["data"]["id"]' <<<"$BODY"); INV_TOKEN=$(jget '["data"]["token"]' <<<"$BODY")
req POST /staff/invitations "$ATOKEN" "{\"email\":\"$INV2_EMAIL\",\"roleId\":\"$CAM_ROLE\"}"
check "POST /staff/invitations (2o, da revocare) -> 201" 201
INV2_ID=$(jget '["data"]["id"]' <<<"$BODY")
req GET /staff/invitations "$ATOKEN" ""
check "GET /staff/invitations -> 200" 200
req GET "/staff/invitations/verify?token=$INV_TOKEN" "" ""
check "GET /staff/invitations/verify (pubblico) -> 200" 200
req POST /staff/invitations/accept "" "{\"token\":\"$INV_TOKEN\",\"firstName\":\"Luca\",\"lastName\":\"Bianchi\",\"password\":\"$INV_PW\"}"
check "POST /staff/invitations/accept -> 200" 200
req POST /auth/staff/login "" "{\"email\":\"$INV_EMAIL\",\"password\":\"$INV_PW\"}"
check "login invitato -> 200" 200
INV_ATOKEN=$(jget '["data"]["accessToken"]' <<<"$BODY")
req GET /auth/me "$INV_ATOKEN" ""
check "me invitato -> 200" 200
IROLE=$(jget '["data"]["role"]' <<<"$BODY"); [ "$IROLE" != "titolare" ] || FAILED+=("invitato non dovrebbe essere titolare")
req GET /staff/invitations "$INV_ATOKEN" ""
check "invitato lista inviti -> 403 (OwnerGuard)" 403
req DELETE "/staff/invitations/$INV2_ID" "$ATOKEN" ""
check "DELETE invito pending -> 200" 200

echo "===== MEMBERS ====="
req GET /staff/members "$ATOKEN" ""
check "GET /staff/members -> 200" 200
INV_MEMB=$(python3 -c 'import sys,json;d=json.load(sys.stdin);print(next((m["id"] for m in d["data"] if m["email"]=="'"$INV_EMAIL"'"),""))' <<<"$BODY")
OWN_MEMB=$(python3 -c 'import sys,json;d=json.load(sys.stdin);print(next((m["id"] for m in d["data"] if m["email"]=="'"$OWNER_EMAIL"'"),""))' <<<"$BODY")
req PUT "/staff/members/$INV_MEMB/role" "$ATOKEN" "{\"roleId\":\"$CASSA_ROLE\"}"
check "PUT /staff/members/:id/role -> 200" 200
req DELETE "/staff/members/$INV_MEMB" "$ATOKEN" ""
check "DELETE /staff/members/:id (disattiva) -> 200" 200

echo "===== EDGE / RBAC ====="
req DELETE "/staff/members/$OWN_MEMB" "$ATOKEN" ""
check "auto-disattivazione titolare -> 400" 400
req POST /staff/invitations/accept "" "{\"token\":\"$INV_TOKEN\",\"firstName\":\"Luca\",\"lastName\":\"Bianchi\",\"password\":\"Pwd1234567!\"}"
check "accept invito già accettato -> 400" 400
req GET /catalog/menus "" ""
check "lettura senza token -> 401" 401
# P.IVA duplicata su un altro ristorante -> 409 (fix di robustezza, non più 500)
req POST /auth/staff/register "" "{\"email\":\"owner2-$TS@byup.test\",\"password\":\"OwnerPwd123!\",\"firstName\":\"Due\",\"lastName\":\"Owner\",\"restaurantName\":\"Secondo Locale\"}"
ATOKEN_O2=$(jget '["data"]["accessToken"]' <<<"$BODY")
req PUT /onboarding/locale "$ATOKEN_O2" "{\"name\":\"Secondo Locale\",\"vatNumber\":\"$OWNER_VAT\",\"addressStreet\":\"Via X\",\"addressCity\":\"Roma\",\"addressProvince\":\"RM\",\"addressZip\":\"00100\",\"regimeFiscale\":\"ordinario\"}"
check "P.IVA duplicata su /onboarding/locale -> 409 (no 500)" 409

echo "===== DEVICES ====="
req POST /devices "$ATOKEN" "{\"type\":\"kds\",\"name\":\"Cucina\"}"
check "POST /devices (KDS) -> 201" 201
DEV_ID=$(jget '["data"]["device"]["id"]' <<<"$BODY"); DEV_USER=$(jget '["data"]["username"]' <<<"$BODY"); DEV_PASS=$(jget '["data"]["password"]' <<<"$BODY")
req GET /devices "$ATOKEN" ""
check "GET /devices -> 200" 200
req POST /devices/login "" "{\"username\":\"$DEV_USER\",\"password\":\"$DEV_PASS\"}"
check "POST /devices/login -> 200" 200
DEVTOK=$(jget '["data"]["deviceToken"]' <<<"$BODY")
req POST /devices/login "" "{\"username\":\"$DEV_USER\",\"password\":\"WRONGPASS\"}"
check "POST /devices/login password errata -> 401" 401
req GET /staff/members "$DEVTOK" ""
check "device token su endpoint staff -> 401" 401
req POST "/devices/$DEV_ID/regenerate-password" "$ATOKEN" ""
check "POST /devices/:id/regenerate-password -> 200" 200
NEWPASS=$(jget '["data"]["password"]' <<<"$BODY")
req POST /devices/login "" "{\"username\":\"$DEV_USER\",\"password\":\"$DEV_PASS\"}"
check "device login con vecchia password dopo regen -> 401" 401
req PUT "/devices/$DEV_ID" "$ATOKEN" "{\"name\":\"Cucina Principale\"}"
check "PUT /devices/:id -> 200" 200
req DELETE "/devices/$DEV_ID" "$ATOKEN" ""
check "DELETE /devices/:id -> 200" 200

echo
echo "==================================================="
echo "TOTALE: $N test | PASSATI: $PASS | FALLITI: $FAIL"
if [ "$FAIL" -gt 0 ]; then echo; echo "--- DETTAGLIO FALLIMENTI ---"; for f in "${FAILED[@]}"; do echo " - $f"; done; fi
