# Bedienungsanleitung – 100 Jahre Hoffest

Diese Anleitung erklärt, wie die Website für Tamara & Ralphs Hoffest
funktioniert und wie man sie während der Feier bedient.

## 1. Die drei Ansichten

Das System besteht aus drei Seiten, die live miteinander verbunden sind.
Änderungen in der Verwaltung erscheinen sofort auf den anderen beiden – man
muss nichts neu laden.

| Seite | Adresse | Für wen |
|---|---|---|
| **Gästeseite** | `/` (z.B. `https://50s.it-srm.de`) | Die Gäste, auf ihrem Handy |
| **Verwaltung** | `/admin` | Wer das Fest steuert (PIN nötig) |
| **Beamer** | `/display` | Läuft im Vollbild auf dem Projektor |

**PIN für die Verwaltung:** `2012` (Standardwert – siehe Abschnitt 8, falls
er geändert wurde).

## 2. Vor dem Fest: Inhalte eintragen

Alles wird unter **`/admin` → Fest & Ablauf** gepflegt, nichts muss im Code
geändert werden:

- **Eckdaten der Feier**: Namen, Titel, Untertitel, Datum, Uhrzeit, Ort,
  Adresse, Gewandung/Dresscode, Einladungstext. Mit **Speichern** bestätigen
  – erscheint sofort oben auf der Gästeseite.
- **Ablauf des Hoffestes**: einzelne Programmpunkte mit Uhrzeit, Titel und
  optionaler Beschreibung. Über die drei Felder unten **+ Hinzufügen**;
  bestehende Zeilen direkt in den Feldern bearbeiten (wird beim Verlassen
  des Feldes automatisch gespeichert), mit **✕** löschen.
- **Impressum & Rechtliches**: Freitext, wird im Impressum-Dialog der
  Gästeseite angezeigt. Eine Leerzeile trennt Absätze. Bitte echten Namen /
  Anschrift statt der Platzhalter `[Name, Anschrift eintragen]` eintragen,
  falls rechtlich gewünscht.

## 3. Während des Fests: Die Bühne steuern

Der Tab **Bühne** ist die Fernbedienung für den Beamer. Was hier gewählt
wird, sehen die Gäste sofort auf der Leinwand:

- **Was zeigt der Beamer?** – ein Klick auf einen der acht Knöpfe
  (Wappen / Ablauf / Chronik / Countdown / Hofnarr / Präsentation / Galerie
  / Gästebuch) schaltet die Beamer-Szene sofort um. „Wappen" ist die
  ruhige Ausgangsanzeige mit Wappen und Titel.
- **Laufschrift**: Text eintragen, mit dem runden Knopf rechts oben
  ein-/ausblenden (z.B. „Der Met wird um 20 Uhr ausgeschenkt …"). Läuft als
  Ticker-Band unten auf Gäste- und Beamer-Seite.
- **Countdown**: Dauer in Sekunden und einen Anlass eintragen, mit
  **Countdown starten** loslassen. Läuft dann groß auf dem Beamer
  (Szene „Countdown" muss aktiv sein, damit man ihn sieht). Mit
  **Countdown stoppen** beenden.
- **Präsentation / Folien**: Zwei Wege für Folien auf dem Beamer:
  - *Einbettungslink*: Link zu Google Slides / OneDrive / Canva einfügen,
    **Live schalten** klicken.
  - *Bilder hochladen*: PNG/JPG-Dateien hochladen (z.B. aus PowerPoint
    exportiert), dann per Miniaturansichten oder **◄ Zurück** / **Weiter ►**
    durchklicken. **Folien löschen** entfernt alle hochgeladenen Bilder.

## 4. Musik (Spotify)

Nur nutzbar, wenn Spotify eingerichtet wurde (siehe README.md, Abschnitt
„Spotify-Musiksteuerung einrichten" – braucht ein Spotify-Premium-Konto und
eine kostenlose Entwickler-App).

1. Im Tab **Musik**: **Mit Spotify verbinden** klicken, einloggen.
2. Auf dem Gerät, das die Musik abspielen soll, einmal Spotify öffnen und
   irgendetwas anspielen – erst dann erscheint es unter „Wiedergabe".
3. Über **Song oder Playlist suchen** einen Titel/Playlist suchen und durch
   Anklicken sofort abspielen. **⏸ Pause** pausiert.
4. Unter „Feste Playlist-Links" können drei Lieblings-Playlists dauerhaft
   hinterlegt werden.

Der aktuell laufende Titel erscheint automatisch als kleine Anzeige oben auf
der Gästeseite und unten auf dem Beamer – ohne weiteres Zutun.

## 5. Das Hofnarr-Rätsel (Ratespiel)

Ein „Wer bin ich?"-Spiel mit bis zu drei Runden. Alles im Tab **Hofnarr**:

**Personen anlegen** (unterer Bereich „Personen bearbeiten"):
1. Runde wählen (Runde 1/2/3).
2. Unten Namen eintragen, **+ Hinzufügen**.
3. Bei der neuen Person Hinweise eintragen (**+ Hinweis** für weitere
   Zeilen). Der Name bleibt bis zur Auflösung geheim – nur die Hinweise
   werden nach und nach gezeigt.

**Spiel steuern** (oberer Bereich):
1. Runde und Person mit **◄ Vorherige Person** / **Nächste Person ►**
   auswählen.
2. **Nächsten Hinweis zeigen** – zeigt Hinweise nacheinander auf Gäste- und
   Beamer-Seite (Beamer-Szene „Hofnarr" muss aktiv sein). **Hinweis
   verbergen** macht den letzten rückgängig.
3. Wenn die Gäste die Person erraten haben: **Antwort auflösen** zeigt den
   echten Namen groß an. **Antwort verbergen** macht das rückgängig, falls
   man versehentlich zu früh geklickt hat.
4. Der runde Knopf oben rechts blendet das Rätsel für die Gäste komplett
   ein/aus.

## 6. Gästebuch und Galerie moderieren

Gäste tragen sich über die Startseite selbst ein (Gästebuch-Nachricht oder
Foto-Upload). Nichts erscheint automatisch öffentlich – alles muss erst
freigegeben werden:

- Tab **Gästebuch** bzw. **Galerie** öffnen (die Zahl im Reiter oben zeigt,
  wie viele Einträge auf Prüfung warten).
- Pro Eintrag: **Freigeben** (erscheint auf Gästeseite/Beamer), **Ablehnen**
  (bleibt unsichtbar, wird aber nicht gelöscht) oder **Löschen**
  (endgültig entfernt, inkl. Foto-Datei).

## 7. Chronik des Abends

Im Tab **Chronik** kann man während des Fests laufend Ereignisse eintragen
(„18:32 – Die Braut hat die Torte angeschnitten"). Uhrzeit wird automatisch
vorausgefüllt, kann aber überschrieben werden. Erscheint sofort in der
Chronik auf der Gästeseite und – bei aktiver Beamer-Szene „Chronik" – auch
auf der Leinwand.

## 8. Der Beamer-Rechner

Auf dem Rechner/Laptop am Projektor im Browser `/display` öffnen und in den
**Vollbildmodus** wechseln (meist `F11`). Die Seite braucht danach keine
weitere Bedienung mehr – sie reagiert nur noch auf das, was im Tab „Bühne"
im Admin-Bereich geschieht.

## 9. Verwaltung verlassen / PIN ändern

- **Abmelden**-Knopf oben rechts in der Verwaltung meldet ab; danach ist
  wieder die PIN-Eingabe nötig.
- Die PIN steht in der Server-Konfiguration unter `ADMIN_PIN` (siehe
  README.md) – dort kann sie vor dem Fest geändert werden, falls gewünscht.

## 10. Kurz-Fahrplan für den Festtag

Ein möglicher Ablauf, welche Beamer-Szene wann sinnvoll ist:

1. **Vor Beginn / Ankunft der Gäste** → Szene „Wappen"
2. **Programm folgt einem festen Ablauf** → Szene „Ablauf"
3. **Kurz vor einem besonderen Moment** → „Countdown" starten, Szene
   „Countdown" aktivieren
4. **Rätselrunde** → Personen/Hinweise vorbereiten, Szene „Hofnarr"
5. **Rede/Präsentation/Fotos aus früheren Jahren** → Szene „Präsentation"
6. **Zwischendurch, damit Gäste ihre Fotos sehen** → Szene „Galerie"
   (rotiert automatisch alle paar Sekunden durch freigegebene Fotos)
7. **Zwischendurch, damit Gäste ihre Gästebuch-Grüße sehen** → Szene
   „Gästebuch" (rotiert automatisch durch freigegebene Einträge)
8. **Wichtige Durchsagen jederzeit** → Laufschrift-Ticker nutzen, unabhängig
   von der gewählten Szene

## 11. Häufige Fragen

**Ein Gast sagt, sein Foto ist nicht sichtbar.**
Fotos erscheinen erst nach Freigabe im Tab „Galerie" (Abschnitt 6). Prüfen,
ob es dort unter „Wartet" liegt.

**Die Seite reagiert nicht mehr / Verbindung wirkt tot.**
Oben rechts in der Verwaltung zeigt ein Punkt „Verbunden" (grün) oder
„Getrennt" (rot). Bei „Getrennt" reicht meist ein Neuladen der Seite
(F5) – gespeicherte Inhalte gehen dabei nicht verloren.

**Musiksteuerung reagiert nicht.**
Prüfen, ob auf dem Wiedergabegerät Spotify offen ist und dort schon einmal
etwas angespielt wurde (Abschnitt 4, Schritt 2).

**Ich habe versehentlich etwas gelöscht.**
Bei Agenda-, Chronik-, Gästebuch- und Galerie-Einträgen gibt es kein
automatisches Rückgängig – die Inhalte müssten erneut eingetragen werden.
Bei Foto-/Gästebuch-Moderation lieber „Ablehnen" statt „Löschen" verwenden,
falls man sich unsicher ist; abgelehnte Einträge lassen sich später wieder
auf „Freigeben" stellen.
