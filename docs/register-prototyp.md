# Register-Prototyp (UI mit Mock-Daten)

**Stand:** 17.11.2026 · Grundlage: SAP-Call vom 06.11.2026, SAP-Folien „Blocked BP Register Requirements“, Pocket Guide ETS-Kategorien (Stand Juli 2026)

## Was enthalten ist

Neue Navigationsgruppe „Sanktionsregister“ in der bestehenden Shell mit sechs Ansichten:

| Ansicht | Inhalt |
| --- | --- |
| Dashboard | Kachel „Zur Freigabe“ statt E-Mail-Hinweis, offene Sperrschritte, Cloud-Tenants, fällige Länder-Kontakte, Kennzahlen nach Monat, Sanktionsliste, Land, ETS und Schrittart |
| Register | Ergebnistabelle mit Suche über Name, BP-ID, ERP-ID und Tenant-ID. Aufklappbare Filter für Land, ETS, Sanktionsliste, Cloud, GTS-Sperrdatum und Status. Die Zeilen öffnen die Fall-Details. |
| Neuer Datensatz | Simulierter GTS-Abruf per Business Partner ID mit Vorschau, einschließlich SuccessRoom (SR) als Information |
| Detail | Vier-Augen-Freigabe mit drei Ausgängen (freigeben, sanktioniert ohne Sperre, ablehnen), Sperrschritte mit Status, Tenants, Empfänger der Benachrichtigung, E-Mail-Entwurf mit Platzhaltern, Audit-Trail |
| Nachbarabteilung | Eingeschränkte Sicht je Team, nur eigene Schritte bestätigen, „Keine Tickets vorhanden“ |
| Länder-Kontakte | General Director, Legal Head, Commercial Director je Region, manuelle Pflege, Prüfintervall 7 Tage |

## Technische Umsetzung

- Fachlogik ohne React in `lib/register/` (`types.ts`, `workflow.ts`, `mock-data.ts`).
- UI unter `app/_register/` (privater Ordner, keine eigene Route), eingebunden in `app/shell.tsx`.
- Seit 17.11.2026 liest `RegisterProvider` die Registerdaten aus PostgreSQL; Änderungen werden über authentifizierte Server Actions gespeichert. Ein Neuladen setzt den Bestand nicht zurück.
- 50 Kunden aus der bereitgestellten Test-CSV ersetzen die bisherigen Kunden-Mock-Daten. Kontakte sind zunächst leer, fehlende Tenant- und Freigabedaten werden nicht erfunden. Details: [Kundenimport](kundenimport.md).

## Annahmen und offene Punkte (mit SAP klären)

1. Reihenfolge der Sperrschritte: SAP-Folien setzen S-User an den Anfang, im Call hieß es Tickets, dann Remote, dann S-User und Cloud parallel. Kernfrage: Lassen sich Tickets noch schließen, wenn der S-User schon gesperrt ist? Im Detail pro Fall vor der Entscheidung wählbar (Variante A und B). A ist der Standard. Nach der Entscheidung verwenden alle Ansichten und der Server die gespeicherte Variante. Bei Altfällen deutet eine Ticket-Rückmeldung vor der S-User-Rückmeldung auf B hin.
2. Soll die Cloud-Sperre zuerst kommen?
3. Aus welchem SAP-System kommen Cloud-Status und Tenants?
4. Abgelehnte Datensätze: nur Audit-Trail oder eigene Liste?
5. Prüfintervall der Länder-Kontakte (Annahme: wöchentlich).

## Nächste Schritte

Die Migration und der CSV-Import sind angewendet. Mit SAP sind insbesondere die CRM-/BP-ID-Zuordnung, fehlende Tenant- und Verantwortlichkeitsdaten sowie fachliche Rollen und die verbindliche Schrittfolge abzustimmen.

## Dashboard-Anbindung (17.11.2026)

Das Register-Dashboard ist die Startansicht. Bestandszahlen, Länder-/ETS-/Listenverteilungen und historische Sperrdaten verwenden alle gespeicherten Kunden, auch noch nicht freigegebene CSV-Fälle. Offene Sperrschritte zählen nur freigegebene laufende oder wartende Schritte. Fehlende Cloud-Tenant-Daten werden als eigene Kennzahl ausgewiesen. Die Zeitachse zeigt alle vorhandenen Jahre; die Jahresauswahl wechselt auf zwölf Monate des gewählten Jahres. Kennzahlen öffnen Registerfilter für Freigaben, offene Schritte, Cloud-Datenlücken und Fälle ohne Sperre. Die Übersicht benennt die Auswahl aus dem Dashboard und bietet die Rückkehr zu allen Kunden an. Kontakte sind ab sieben Tagen oder ohne Prüfdatum fällig.

Eigene Änderungen aktualisieren das Dashboard nach erfolgreicher Speicherung. „Daten aktualisieren“ lädt den aktuellen Datenbankstand anderer Sitzungen. Keine automatische Freigabe, kein Polling und keine neuen externen Systemanbindungen.

Verifikation: Logiktests für Bestands-/Workflowtrennung, historische Monats-/Jahreswerte, Filterziele und leere Daten; Typecheck und Build erfolgreich, ESLint ohne Fehler (vier vorhandene Warnungen). Browser-Test mit temporärem Login bestätigt Startansicht, Datenbank-Kennzahlen sowie SR-/Cloud-Filter und Navigation zum Register.

## Navigation (19.11.2026)

Dashboard ersetzt Home als oberster Navigationseintrag und als Ziel des Logo-Klicks. Die separate persönliche Todo-App einschließlich Komponenten, Browser-Speicherzugriff und CSS wurde entfernt. Die Nachbarabteilungsansicht und die fachlichen Sperrschritte bleiben erhalten.
