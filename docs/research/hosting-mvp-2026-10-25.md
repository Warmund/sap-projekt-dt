# Hosting-Optionen für den MVP

Stand: 25.10.2026. Grundlage ist die bestehende Infrastruktur: eine Next.js-App als Docker-Container und PostgreSQL. Der MVP verwendet Mock-Daten und soll nicht in SAP GTS integriert werden.

## Empfehlung: Render für eine öffentlich vorführbare Demo

Für eine Demo mit URL, HTTPS, Datenbank und möglichst wenig Betriebsaufwand ist **Render** die passendste Option. Die App wird als Docker-Web-Service aus dem vorhandenen `Dockerfile` gebaut; PostgreSQL läuft separat als verwaltete Render-Postgres-Datenbank. Render bietet dafür private Kommunikation zwischen App und Datenbank, automatische TLS-Zertifikate, eigene Domains, Health Checks und Git-basierte Deployments.

### Grobe monatliche Kosten

| Bestandteil | Preis laut Anbieter | Einordnung |
| --- | ---: | --- |
| Render-Hobby-Workspace | 0 USD | Für einen MVP ausreichend. |
| Web-Service, 256 MB | 6 USD | Untergrenze; für Next.js kann 512 MB sinnvoller sein. |
| PostgreSQL, 256 MB | 10 USD | Kleinste bezahlte Datenbankinstanz. |
| Datenbank-Speicher | 0,30 USD/GB | Zusätzlich zum Compute-Plan. |
| **Minimaler Dauerbetrieb** | **ab ca. 16 USD/Monat** | Rechnet man mit etwas Reserve und Traffic: eher **20–30 USD/Monat**. |

Die kostenlose Postgres-Instanz ist nur für einen kurzfristigen Test geeignet: Sie läuft nach 30 Tagen ab, besitzt keine Backups und kann jederzeit neu gestartet werden.

### Anpassungen gegenüber dem aktuellen Compose-Setup

- `docker compose` wird nicht als Ganzes deployt. Der `app`-Container wird als Render-Web-Service betrieben; Render Postgres ersetzt `db`.
- `DATABASE_URL` muss auf die interne Render-Postgres-URL zeigen. Die Datenbank darf nicht öffentlich freigegeben werden.
- Die App muss an `0.0.0.0` und den von Render gesetzten `PORT` binden.
- Migrationen gehören in einen Pre-Deploy-Schritt bzw. einen eigenen einmaligen Job. Der jetzige `runner` enthält bewusst keine Prisma-CLI; deshalb ist `prisma migrate deploy` nicht ohne kleine Dockerfile-/Deployment-Anpassung ausführbar.
- Ein HTTP-Health-Endpoint sollte ergänzt werden; Render kann ihn beim Deploy und während des Betriebs prüfen.

## Günstigste Option: Hetzner Cloud mit dem bestehenden Compose-Stack

Ein kleiner Hetzner-Cloud-Server in Deutschland oder Finnland kann den vorhandenen Compose-Stack praktisch unverändert ausführen. Der CAX11 kostet seit dem 15.06.2026 **5,99 EUR/Monat netto** bzw. **7,13 EUR/Monat inklusive 19 % USt.**

Das ist die günstigste laufende Variante, aber nicht „mit allem drum und dran“: Das Team verantwortet Linux-Updates, Firewall, Reverse Proxy, TLS, Backups und Wiederherstellung selbst. Für eine benotete kurzfristige Demo ist dies nur sinnvoll, wenn jemand diese Betriebsaufgaben bewusst übernehmen möchte.

## Alternative: Railway

Railway ist ebenfalls gut kompatibel: App und PostgreSQL können in einem Projekt über ein privates Netzwerk verbunden werden; PostgreSQL erhält dabei ein persistentes Volume. Das Hobby-Abo kostet mindestens 5 USD/Monat und enthält 5 USD Nutzungsvolumen. Darüber werden RAM (10 USD/GB/Monat), CPU (20 USD/vCPU/Monat), Egress und Volume-Speicher verbrauchsabhängig berechnet.

Railway ist schnell eingerichtet, aber für einen dauerhaft laufenden App- und DB-Stack weniger gut kalkulierbar als Render. Backups, Point-in-Time-Recovery und Hochverfügbarkeit müssen außerdem aktiv eingeschaltet werden.

## Alternative: Vercel mit Marketplace-Postgres

**Vercel ist technisch eine gute Option**, weil Next.js dort direkt als Serverless-/Fluid-Compute-Anwendung betrieben wird. Die Next.js Route Handlers und Server Actions laufen als Vercel Functions; das vorhandene Docker-Image und der `docker compose`-Stack würden für die gehostete Umgebung jedoch nicht verwendet.

Für PostgreSQL wird eine Marketplace-Integration benötigt. Vercel Postgres wird für neue Projekte nicht mehr angeboten; stattdessen können beispielsweise Prisma Postgres, Neon oder Supabase über den Marketplace eingebunden werden. Die Integration hinterlegt die Zugangsdaten als Umgebungsvariablen im Vercel-Projekt. Für Prisma ist Prisma Postgres naheliegend, da es Connection Pooling bietet und explizit mit Prisma ORM arbeitet.

### Wann Vercel die bessere Wahl ist

- Die App bleibt eine klassische Next.js-Anwendung ohne dauerhaft laufende Hintergrundprozesse; das entspricht dem MVP.
- Deployments und Preview-URLs für Pull Requests sind besonders bequem.
- Es wird ein serverloser PostgreSQL-Anbieter akzeptiert und die Prisma-Migrationen werden als Build-/CI-Schritt eingerichtet.

### Einschränkungen und Kostenhinweise

- Der `migrate`-Compose-Service muss durch einen expliziten Migrationsschritt im Deployment ersetzt werden.
- Funktionen haben Laufzeitgrenzen; für den aktuellen MVP ohne Worker ist das unkritisch, für spätere Hintergrundjobs aber nicht passend.
- Der Vercel-Hobby-Plan ist für persönliche, nicht-kommerzielle Nutzung gedacht. Für ein privates Repository im persönlichen GitHub-Account ist die GitHub-Organisations-Einschränkung nicht relevant.
- Für eine Demo ist **0 USD/Monat** realistisch: Vercel Hobby ist kostenlos; der kostenlose Prisma-Postgres-Tarif umfasst 200.000 Datenbankoperationen und 500 MB Speicher. Bei Überschreiten des Limits nimmt die Datenbank keine Lese- oder Schreibzugriffe mehr an, bis der Monatszeitraum zurückgesetzt wird oder ein Upgrade erfolgt.
- Die erste bezahlte Prisma-Postgres-Stufe kostet **10 USD/Monat** und enthält 1 Mio. Operationen sowie 10 GB Speicher; darüber hinaus kosten Operationen 8 USD je weitere 1 Mio. Auf dem bezahlten Plan gibt es tägliche Backups mit sieben Tagen Aufbewahrung.
- Falls Zusammenarbeit und Funktionen des Vercel-Pro-Plans erforderlich werden, kostet dieser 20 USD pro Nutzer und Monat zuzüglich der Datenbank. Vercel-Infrastruktur kann zusätzlich nutzungsbasiert abgerechnet werden.

**Einordnung:** Für eine studentische Demo mit individuellem Repository und geringem Datenvolumen kann Vercel plus Marketplace-Postgres sehr gut und günstig sein. Für eine Team-Demo mit vorhersehbaren Gesamtkosten bleibt Render die einfachere Empfehlung.

## Entscheidungsvorschlag

1. Für eine zeitlich begrenzte Demo: **Render** mit bezahltem, kleinem Postgres und Docker-Web-Service einplanen (ca. 20–30 USD/Monat).
2. Für den lokalen Unterrichts-/Präsentationsbetrieb: beim bestehenden `docker compose` bleiben (0 EUR Hostingkosten).
3. Erst bei einem echten Produktivbedarf mit SAP-Freigabe, personenbezogenen oder Sanktionsdaten eine Hosting- und Datenschutzentscheidung mit SAP treffen; diese Recherche ist keine Freigabe für solche Daten in einem externen Dienst.

## Primärquellen

- [Render: Preise](https://render.com/pricing)
- [Render: Docker-Deployments](https://render.com/docs/docker)
- [Render: Web Services, Domains und TLS](https://render.com/docs/web-services)
- [Render: Free-Postgres-Einschränkungen](https://render.com/docs/free)
- [Render: Backups und Point-in-Time Recovery](https://render.com/docs/postgresql-backups)
- [Railway: Pläne und verbrauchsabhängige Preise](https://docs.railway.com/pricing/plans)
- [Railway: PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Railway: Verantwortlichkeiten bei Datenbanken](https://docs.railway.com/databases)
- [Hetzner: Preisanpassung Cloud Server vom 15.06.2026](https://docs.hetzner.com/de/general/infrastructure-and-availability/price-adjustment/)
- [Vercel: PostgreSQL über Marketplace-Integrationen](https://vercel.com/docs/postgres)
- [Vercel: Prisma Postgres im Marketplace](https://vercel.com/marketplace/prisma)
- [Vercel: Limits für den Hobby-Plan und GitHub-Organisationen](https://vercel.com/docs/limits)
- [Vercel: Preise und nutzungsbasierte Infrastruktur](https://vercel.com/docs/pricing)
- [Vercel: kostenloser Hobby-Plan und Limits](https://vercel.com/docs/plans/hobby)
- [Prisma Postgres: Preise](https://www.prisma.io/pricing)
- [Prisma Postgres: Verhalten nach Erreichen des Gratislimits](https://www.prisma.io/docs/postgres/faq)
