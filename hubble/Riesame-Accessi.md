# Riesame periodico dei diritti di accesso — il rito su foglio

Il controllo è **ISO/IEC 27001 A.5.18**: poter dimostrare che a una certa data
una persona ha guardato chi ha accesso a cosa e ha deciso, e che le revoche
sono state eseguite. Con **D-44** il rito non vive più dentro Hubble: si svolge
fuori dal prodotto, su foglio di calcolo. Dentro il prodotto si concedono e si
revocano accessi, e nient'altro (P-56). Ambito: il solo team admin di Byup.

## Come si fa

**Cadenza trimestrale.** Il primo giorno lavorativo del trimestre il revisore
apre il foglio della campagna: una riga per persona, esportata dalla scheda
**Impostazioni → Sicurezza e sistemi → Accessi**, che mostra chi ha accesso,
con quale ruolo, l'ultimo accesso e il secondo fattore; gli inviti in attesa
non ci sono, perché chi non ha accettato non ha accesso.

**Il rischio è una colonna.** Il revisore ordina il foglio dall'anomalia in giù,
e la scrive: *mai acceduto*, *dormiente* (nessun accesso da oltre novanta
giorni), *permessi cambiati* rispetto alla campagna precedente, *mai
riesaminato*, *invariato*. Ordinato per nome si timbra dall'alto senza leggere.

**Una decisione per riga**, con chi, quando e perché: *confermato* o
*revocato*. Le invariate si confermano in blocco solo perché il confronto con
la campagna precedente lo si è fatto riga per riga sul foglio: si attesta che
non è cambiato nulla, non si timbra alla cieca.

**La revoca si esegue nel prodotto**, dalla scheda Accessi, dove il motivo è
obbligatorio e finisce nell'audit log con autore e orario: senza motivo non è
evidenza. Nel foglio si riporta la data della revoca.

**Firma e archivio.** Chiusa la campagna, il revisore firma il foglio (PDF
firmato, il CSV per le carte di lavoro) e lo archivia dove chi tocca il
database non arriva: storage in sola aggiunta, con la data. Una campagna
chiusa non si modifica: una correzione è una campagna nuova.

## I limiti dichiarati

**Il Super Admin titolare non ha un pari** che lo verifichi: la sua riga si
conferma d'ufficio e la limitazione della segregazione dei compiti va
dichiarata e compensata nella valutazione del rischio e nella Dichiarazione di
Applicabilità. Quando ci saranno due Super Admin il punto decade.

**Nessuna data di uscita** si registra sulle persone: chi non lavora più qui
viene intercettato come dormiente, dall'assenza di accessi.

Codice che resta: la scheda Accessi in [admin-team.jsx](admin-team.jsx)
(componente `AccessiList`) e i dati del team in
[admin-data.jsx](admin-data.jsx) (`TEAM`, `INVITI_PENDENTI`). Le campagne mock,
la classificazione automatica, la firma e la revoca multipla sono state
rimosse con D-44.
