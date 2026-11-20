# Kundenregister und CSV-Import

Stand: 17.11.2026.

Die bereitgestellte Datei `Customers data test(Blocked Customers).csv` wurde in die bereits mit der Anwendung verbundene Neon-PostgreSQL-Datenbank importiert. Es wurde keine zweite Datenbank angelegt: Die Registertabellen ergänzen die vorhandenen Better-Auth-Tabellen.

## Tabellen und Anwendung

- `RegisterPartner`: Kundenstammdaten, CSV-Kennzeichen, Freigabe, Herkunft, Versionsnummer.
- `RegisterTenant`: Tenant-ID, Produkt, LoB und Ticket pro Kunde.
- `RegisterStep`: Rückmeldung je Kunde und Sperrschritt, einschließlich Zeitpunkt und Bearbeiter.
- `RegisterAudit`: chronologischer Verlauf pro Kunde.
- `RegisterContact`: Empfänger je Region, zugehörige Länder und letzter Prüfzeitpunkt.

Die Startseite liest das Register nach der Anmeldung aus der Datenbank. Die bestehenden Ansichten für Register, Dashboard, Detail, Aufgaben und Kontakte nutzen diese Daten. Änderungen werden über authentifizierte Server Actions gespeichert. Ein Fehlschlag wird angezeigt und nicht als erfolgreiche lokale Änderung dargestellt. „Daten neu laden“ ersetzt den bisherigen destruktiven Demo-Reset.

Neue Datensätze starten grundsätzlich mit `pending`. Die Person, die einen neuen Datensatz anlegt, kann ihn nicht selbst entscheiden (Prüfung über User-ID). Aufgaben können nur in der freigegebenen Reihenfolge bestätigt werden. Eine Versionsprüfung verhindert stilles Überschreiben zwischen zwei geöffneten Sitzungen. Technische Login-Rollen sind weiter `user`/`admin`; fachliche EC-/Abteilungsberechtigungen sind noch nicht vereinbart. Im MVP dürfen angemeldete Projektmitglieder das Register bearbeiten; die Teamwahl der Aufgabenansicht ist keine Sicherheitsgrenze.

## Zuordnung der CSV-Spalten

| CSV | Datenbank | Bedeutung |
| --- | --- | --- |
| Customer Name | `name` | Unverändert |
| ERP# | `erpId` | Text, führende Nullen bleiben erhalten |
| CRM | `bpId` | CRM-ID als Schlüssel der vorhandenen BP-/Registeransicht; fachliche Gleichheit zur GTS-BP-ID noch bestätigen |
| Country | `country` | Länderbezeichnung unverändert, keine automatische Korrektur |
| Region | `region` | Region unverändert |
| ETS Category | `ets` | Bestehende ETS-Kategorien einschließlich ETR1 |
| Date of blocking | `gtsBlockedAt`, `gtsDateOnly` | TT.MM.JJJJ, technisch UTC-Mitternacht; Anzeige als Datum ohne erfundene Uhrzeit |
| Comment | `comment` | Vollständig, einschließlich Kommas und Sonderzeichen |
| SPL | `spl` | Eigenständiges Ja/Nein-Kennzeichen; keine Ableitung einer konkreten Sanktionsliste |
| SR | `specialCategory` | Yes → SR, No → keine Sonderkategorie |
| Cloud | `cloudCustomer` | Eigenständiges Ja/Nein-Kennzeichen |
| RU IT consultancy BAN | `ruItConsultancyBan` | Eigenständiges Ja/Nein-Kennzeichen |
| Ukraine Crisis | `ukraineCrisis` | Eigenständiges Ja/Nein-Kennzeichen |

CSV-Format: Komma als Trennzeichen, Anführungszeichen und mehrzeilige Felder unterstützt, UTF-8 oder Windows-1252. Die vorliegende Datei ist Windows-1252. Vor dem ersten Schreibzugriff werden Spalten, Datumswerte, Kategorien, Kennzeichen und doppelte CRM-IDs geprüft. Daten und Herkunft werden gemeinsam in einer Transaktion geschrieben. Eine bestehende CRM-ID derselben Quelldatei wird übersprungen; eine Kollision mit einer anderen Quelle bricht den Import ab. Ein geänderter Bestand wird durch einen Wiederholungsimport bewusst nicht aktualisiert.

Die CSV enthält weder Freigaben noch tatsächliche Aufgabenerledigungen, Tenant-IDs, konkrete Sanktionslisten oder EC-/Länderverantwortliche. Deshalb sind alle importierten Fälle zunächst **zur Prüfung**, ohne erledigte Schritte oder Tenants. Die Sanktionsliste lautet „Nicht angegeben (CSV)“; Kommentare werden nicht als strukturierte Listen interpretiert. Die vier Regionen erhalten leere Kontaktplätze ohne erfundene Personen und ohne Prüfdatum. Eine Cloud-Sperre ohne Tenant-Daten kann nicht als abgeschlossen bestätigt werden. Die vorhandene Rückmeldungssimulation ist ausdrücklich als `SIMULIERT` im Verlauf gekennzeichnet und bedient keine externen Systeme.

Die Quelldatei bleibt außerhalb des öffentlichen Git-Repositories. Der Import ist keine Bestätigung tatsächlich geltender Sanktionen gegen die genannten Unternehmen.

## Ausführen

Voraussetzung: Node.js 24, `npm ci`, `DATABASE_URL` in einer ignorierten `.env`. Für einen lokalen App-Start zusätzlich eigene lokale `BETTER_AUTH_SECRET` und `BETTER_AUTH_URL` konfigurieren. Die Produktions-Auth-Secrets bleiben in Vercel.

```bash
npx prisma migrate deploy
npm run import:customers -- "/pfad/Customers data test(Blocked Customers).csv"
```

Migration: `prisma/migrations/20261117000000_register/migration.sql`. Sie erstellt ausschließlich neue Tabellen, Enums, Indizes und Fremdschlüssel; bestehende Auth-Tabellen werden nicht verändert. Im Vercel-Build erzeugt der vorhandene `postinstall` den Prisma-Client. Migrationen werden weiterhin explizit ausgeführt.

## Verifikation

Am 17.11.2026:

- 50 Kunden, 14 Länder, 4 Regionen; davon 9 Cloud-Kunden, 7 SR-Kunden und 21 SPL-Kennzeichen.
- Alle 13 Quellspalten und alle 50 Datensätze gegen die gespeicherten Werte abgeglichen.
- Zweiter Importlauf: 0 neue Kunden, 50 übersprungen; keine Duplikate und kein zurückgesetzter Workflow.
- Bestandszahlen von User, Account und Session vor und nach Migration/Import identisch.
- Typecheck, ESLint (nur vier vorhandene Warnungen) und Production-Build erfolgreich. Browser-Test mit temporärem Login: Anmeldung, Suche nach importierter CRM-ID, Quelldaten/Cloud-Hinweis und erneutes Laden geprüft; beide Playwright-Tests erfolgreich.
- Integrationstest mit temporärem Datensatz: Persistenz, Vier-Augen-Prüfung, Aufgabenreihenfolge, veraltete Schreibzugriffe, Audit und Cloud-Schutz geprüft; Testdatensatz anschließend entfernt.

```bash
npm run test:register
RUN_REGISTER_INTEGRATION=1 npm run test:register
# Zusätzlich bei lokaler App-Konfiguration und migrierter Datenbank:
RUN_REGISTER_E2E=1 npx playwright test tests/register.spec.ts
```

Der Integrationstest schreibt ausschließlich einen eindeutig markierten temporären Testkunden und entfernt ihn anschließend. Der Browser-Test legt einen temporären Test-Login an und entfernt ihn ebenfalls. Die normalen Parser-Tests benötigen keine Datenbank.

Der Build meldet außerdem eine bekannte Sicherheitslücke der bereits installierten Next.js-Version 16.4.3. Ein Framework-Upgrade ist noch offen und war nicht Teil dieses Imports.

## Beispielwerte für die Demo

Die CSV enthält keine Freigaben, Schritte, Tenants, Sanktionslisten oder Länder-Kontakte. Damit die Demo alle Funktionen zeigt, ergänzt `scripts/demo-values.ts` erfundene Werte. Alles ist erkennbar markiert: Verlaufseinträge beginnen mit „BEISPIELWERT“, Sanktionslisten mit „Beispiel:“, Tenant-IDs mit „TEN-DEMO-“, Personen enden auf „(Beispiel)“.

```bash
npm run demo:values -- --dry-run   # nur anzeigen
npm run demo:values                # schreiben
npm run demo:values -- --undo      # alle Beispielwerte entfernen
```

- Bearbeitet nur unberührte Kunden (zur Prüfung, ohne Schritte, noch ohne Beispielwerte). Ein zweiter Lauf ändert nichts.
- Verteilung nach Sperrdatum: die 8 jüngsten Fälle bleiben zur Prüfung, ETS5 wird „sanktioniert ohne Sperre“, ETS2 wird als Fehlalarm abgelehnt, 8 weitere freigegebene Fälle stehen mitten in den Sperrschritten, der Rest ist abgeschlossen.
- Cloud-Kunden ohne Tenants erhalten 1 bis 3 Tenants, leere Kontaktfelder werden gefüllt.
- `--undo` entfernt nur Beispielwerte. Was das Team danach selbst erledigt hat, bleibt erhalten; ein Fall mit eigenen Rückmeldungen behält dabei seine Freigabe.
- Lokal mit Testdatenbank geprüft (50 Testkunden im CSV-Format): Verteilung, Wiederholbarkeit, chronologischer Verlauf, App-Aktion auf einem Beispielfall und `--undo`.
