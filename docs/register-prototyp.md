# Register-Prototyp (UI mit Mock-Daten)

**Stand:** 12.11.2026 · Grundlage: SAP-Call vom 06.11.2026, SAP-Folien „Blocked BP Register Requirements“, Pocket Guide ETS-Kategorien (Stand Juli 2026)

## Was enthalten ist

Neue Navigationsgruppe „Sanktionsregister“ in der bestehenden Shell mit sechs Ansichten:

| Ansicht | Inhalt |
| --- | --- |
| Dashboard | Kachel „Zur Freigabe“ statt E-Mail-Hinweis, offene Sperrschritte, Cloud-Tenants, fällige Länder-Kontakte, Kennzahlen nach Monat, Sanktionsliste, Land, ETS und Schrittart |
| Register | Teil 1 Sperr-Workflow, Teil 2 „Sanktioniert ohne Sperre“, Suche über Name, BP-ID, ERP-ID und Tenant-ID, Filter, CSV-Export |
| Neuer Datensatz | Simulierte Übernahme aus GTS, Sanktionsliste als Auswahlliste, Cloud-Prüfung mit Tenants je LoB, Sonderkategorie SR |
| Detail | Vier-Augen-Freigabe mit drei Ausgängen (freigeben, sanktioniert ohne Sperre, ablehnen), Sperrschritte mit Status, Tenants, Empfänger der Benachrichtigung, E-Mail-Entwurf mit Platzhaltern, Audit-Trail |
| Nachbarabteilung | Eingeschränkte Sicht je Team, nur eigene Schritte bestätigen, „Keine Tickets vorhanden“ |
| Länder-Kontakte | General Director, Legal Head, Commercial Director je Region, manuelle Pflege, Prüfintervall 7 Tage |

## Technische Umsetzung

- Fachlogik ohne React in `lib/register/` (`types.ts`, `workflow.ts`, `mock-data.ts`).
- UI unter `app/_register/` (privater Ordner, keine eigene Route), eingebunden in `app/shell.tsx`.
- Zustand nur im Browser (`RegisterProvider`). **Keine Datenbankänderung, keine Migration.** Ein Neuladen setzt die Demo zurück.
- Alle Daten sind erfunden.

## Annahmen und offene Punkte (mit SAP klären)

1. Reihenfolge der Sperrschritte: SAP-Folien setzen S-User an den Anfang, im Call hieß es Tickets, dann Remote, dann S-User und Cloud parallel. Kernfrage: Lassen sich Tickets noch schließen, wenn der S-User schon gesperrt ist? Im Detail umschaltbar (Variante A und B).
2. Soll die Cloud-Sperre zuerst kommen?
3. Aus welchem SAP-System kommen Cloud-Status und Tenants?
4. Bedeutung der Sonderkategorie SR.
5. Abgelehnte Datensätze: nur Audit-Trail oder eigene Liste?
6. Prüfintervall der Länder-Kontakte (Annahme: wöchentlich).

## Nächste Schritte

Nach Abstimmung mit SAP Datenmodell in Prisma übernehmen (Migration mit dem Team abstimmen, gemeinsame Datenbank) und die Mock-Daten als Seed bereitstellen.
