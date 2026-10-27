# Infrastruktur

> Status: Entwurf. Gilt für den MVP bzw. POC. Inhaltliche Themen (Workflow, Domänenmodell, Mail, Import, Auth) werden in `docs/projektkonzept.md` konsolidiert. Der lokale Betrieb ist hier geplant; die Umgebung für die Abschlussdemo ist noch offen.

## Entscheidungen

| Bereich | Entscheidung |
|---|---|
| Architektur | Fullstack-Anwendung mit **Next.js** (App Router, TypeScript). Kein separates Backend. |
| UI | **UI5 Web Components for React** (`@ui5/webcomponents-react`), SAP Design System (Fiori) |
| API | Next.js Route Handlers und Server Actions |
| ORM | **Prisma** (Schema, Migrationen, generierte Typen) |
| Datenbank | **PostgreSQL** |
| Betrieb / Deployment | Lokal startet `docker compose up` den geplanten Stack; externes Demo-Hosting ist noch offen |
| Entwicklung | DB im Container, App lokal mit `npm run dev` (siehe "Entwicklung und Start") |

## Versionen

Major-Versionen werden festgelegt und nur bewusst angehoben. Exakte Versionen stehen im Lockfile.

| Komponente | Version | Festgelegt in |
|---|---|---|
| Node.js | 24 (LTS) | `.nvmrc`, `engines` in `package.json`, Basis-Image `node:24-alpine` |
| Paketmanager | npm (liegt Node bei) | `package-lock.json` ist eingecheckt; im Docker-Build `npm ci` |
| Next.js | 16 | `package.json` |
| Prisma ORM | 7 | `package.json` (`prisma`, `@prisma/client`, `@prisma/adapter-pg`) |
| PostgreSQL | 18 | Image `postgres:18-alpine` |

Relevante Konventionen dieser Versionen:

- **Next.js 16:** Die frühere `middleware.ts` heißt `proxy.ts`.
- **Prisma 7:** Die DB-Verbindung steht in `prisma.config.ts`, nicht mehr in `schema.prisma`. Der Client wird mit dem Generator `prisma-client` in einen festen Ordner erzeugt (`lib/generated/prisma`, nicht im Git) und verbindet sich über den Driver-Adapter `@prisma/adapter-pg`. Prisma lädt `.env` nicht mehr selbst; `prisma.config.ts` importiert dafür `dotenv/config`. Seeds laufen nur noch explizit über `prisma db seed`.

## Begründung der Fullstack-Entscheidung

- Ein Projekt, ein Container und gemeinsame Typen für UI und API. Es gibt kein CORS, keine Cookie-Verdrahtung zwischen zwei Diensten und keinen doppelten API-Client.
- Auth, Rollen und Admin-Seite lassen sich mit einer Auth-Bibliothek und `proxy.ts` umsetzen. Das spätere SSO kommt als OIDC-Provider dazu, ohne dass der Rest umgebaut werden muss. Welche Bibliothek, wird mit dem Thema Auth entschieden.
- Dashboard, Suche, Mock-Mail, Import und Workflow-Aktionen sind alle mit Server Components, Route Handlers und Server Actions abbildbar.
- Läuft mit `output: 'standalone'` als normaler Node-Container im `docker compose`.
- Eine Trennung in Frontend und API lohnt sich erst, wenn mehrere Clients die API nutzen oder SAP einen eigenen Backend-Dienst (z. B. auf BTP) verlangt. Beides ist aktuell nicht gefordert.

## Überblick

Das bearbeitbare Architekturdiagramm liegt unter [`docs/architektur-mvp.drawio`](architektur-mvp.drawio). Durchgezogene Verbindungen stellen den MVP dar; gestrichelte Verbindungen zeigen spätere Integrationsmöglichkeiten außerhalb des MVP.

```
Browser ──► app (Next.js, :3000) ──► db (PostgreSQL, :5432)
                                      ▲
            migrate (einmalig) ───────┘
```

Der Browser spricht nur mit der Next.js-App. Nur der Server-Teil der App greift über Prisma auf die Datenbank zu.

## Services (`docker-compose.yml`)

| Service | Zweck | Port (Host) | Hinweise |
|---|---|---|---|
| `db` | PostgreSQL | `${DB_PORT:-5432}` → 5432, nur an `127.0.0.1` gebunden | Named Volume `pgdata` für die Persistenz. Healthcheck via `pg_isready`. |
| `migrate` | Führt `prisma migrate deploy` aus und beendet sich | – | Image-Stage `tools` (enthält Prisma-CLI, Schema, Migrationen, Seed). `depends_on: db: condition: service_healthy`. Wird auch für den Seed genutzt. |
| `app` | Next.js (UI und API), `node server.js` | `${APP_PORT:-3000}` → 3000 | Image-Stage `runner` (Standalone-Output, ohne Prisma-CLI). `depends_on: migrate: condition: service_completed_successfully`. |

Warum ein eigener `migrate`-Service: Der Standalone-Output von Next.js enthält nur die Dateien, die die App zur Laufzeit braucht. Die Prisma-CLI gehört nicht dazu. Statt sie in das schlanke App-Image nachzurüsten, läuft die Migration einmalig vor dem App-Start in einem eigenen Container. Schlägt sie fehl, startet die App nicht.

Es gibt keinen Broker, keinen Mailserver und keine Workflow-Engine als eigenen Container. Im MVP wird keine echte Mail verschickt. Eine Sendeaktion erzeugt stattdessen einen nachvollziehbaren Mock-Eintrag beziehungsweise eine sichtbare In-App-Aufgabe; Empfänger und Ereignisse werden mit dem Processflow festgelegt.

## Docker-Image (`Dockerfile`, Multi-Stage)

| Stage | Inhalt | Genutzt von |
|---|---|---|
| `deps` | `npm ci` auf Basis von `package-lock.json` | `tools`, `builder` |
| `tools` | `deps` plus `prisma/`, `prisma.config.ts` | `migrate` |
| `builder` | `prisma generate`, dann `next build` (mit `output: 'standalone'`) | `runner` |
| `runner` | `.next/standalone`, `.next/static`, `public/`; läuft als Nicht-Root-User | `app` |

Der Prisma-Client wird beim Build erzeugt (`prisma generate` vor `next build`) und landet über den Standalone-Trace im Image. Ab Prisma 7 sind dafür keine separaten Engine-Binaries nötig.

## Konventionen für die Next.js-App

- **UI5-Seiten als Client Components.** Jede Datei mit UI5-Komponenten beginnt mit `"use client"`. Dashboard, Suche, Formulare und Admin-Seite sind Client Components. Server Components werden nur für Layout und Datenabruf genutzt. Grund: UI5 Web Components sind Web Components und im Server-Rendering anfällig für Hydration-Warnungen. Offizielle Vorlage: `UI5/webcomponents-react/examples/nextjs-app`.
- **Prototyp zuerst.** Vor dem eigentlichen Aufbau wird ein kleiner Prototyp (UI5-Shell, Tabelle, Login) gebaut, um SSR-Verhalten zu prüfen.
- **Kein Caching für Dashboard-Daten.** Seiten mit Fachdaten rendern dynamisch (`export const dynamic = 'force-dynamic'`), damit nichts veraltet angezeigt wird.
- **Fachlogik in `lib/`.** Module wie `lib/partners`, `lib/cases` und `lib/tasks` importieren weder React noch Next.js. Dort liegt auch das Interface `SanctionSource` als spätere GTS-Nahtstelle. So bleibt ein Herauslösen in ein eigenes Backend möglich.
- **Keine Hintergrundjobs in Request-Handlern.** Im MVP werden Workflow-Schritte direkt in der auslösenden Aktion ausgeführt. Bei Bedarf später ein Worker-Container.
- **Ein Prisma-Client pro Prozess.** `lib/db.ts` erzeugt den Client einmal und hängt ihn in der Entwicklung an `globalThis`, damit Hot Reload keine neuen Verbindungen aufbaut. Nur `lib/` importiert aus `lib/generated/prisma`.
- **`proxy.ts` nur für grobe Weiterleitungen.** Dort wird höchstens geprüft, ob eine Session existiert (z. B. Redirect zum Login). Die eigentliche Berechtigungsprüfung passiert in Server Actions, Route Handlers und `lib/`, direkt vor dem Datenzugriff.

## Konfiguration

- Alle Einstellungen laufen über Umgebungsvariablen. Die Vorlage liegt in `.env.example` und wird zu `.env` kopiert.
- `.env` ist nicht im Git. Es werden keine Secrets committet.
- Eine `.env` für alles: Docker Compose liest sie für die Variablen in `docker-compose.yml`, Next.js liest sie bei `npm run dev`, Prisma über `dotenv/config` in `prisma.config.ts`.
- `DATABASE_URL` in `.env` zeigt auf `localhost`, weil App und Prisma-CLI in der Entwicklung auf dem Host laufen. Für die Container `app` und `migrate` setzt `docker-compose.yml` die Variable selbst, mit dem Host `db`:
  `DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`
- Variablen:

| Variable | Beispiel (`.env.example`) | Verwendet von |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `app` / `change-me` / `sanctions` | `db`, Compose (für `DATABASE_URL` der Container) |
| `DATABASE_URL` | `postgresql://app:change-me@localhost:5432/sanctions` | lokale App und Prisma-CLI auf dem Host |
| `DB_PORT` | `5432` | Host-Port der DB. Ändern, falls lokal schon ein Postgres läuft (dann auch in `DATABASE_URL`). |
| `APP_PORT` | `3000` | Host-Port der App im Compose-Betrieb. Im Container lauscht die App immer auf 3000. |

Weitere Variablen, etwa für Auth-Secrets, kommen mit den jeweiligen Konsolidierungen dazu.

## Entwicklung und Start

Es gibt genau zwei Betriebsarten.

**1. Entwicklung (Standard für das Team):** DB im Container, App lokal mit Hot Reload.

```bash
cp .env.example .env
npm ci
docker compose up -d db          # nur die Datenbank
npx prisma migrate dev           # Migrationen anwenden bzw. neue erzeugen, generiert den Client
npx prisma db seed               # Mock-Daten laden
npm run dev                      # http://localhost:3000
```

**2. Demo / produktionsnah:** Alles im Container, gebautes Image ohne Hot Reload.

```bash
cp .env.example .env
docker compose up --build -d                         # db -> migrate -> app
docker compose run --rm migrate npx prisma db seed   # Mock-Daten laden (einmalig bzw. nach Reset)
docker compose down                                  # stoppen, Daten bleiben
docker compose down -v                               # stoppen und DB-Daten löschen (Reset)
```

Ein `next dev` im Container (Bind-Mounts, Override-Datei) gibt es bewusst nicht: Datei-Watching über Bind-Mounts ist unter Windows langsam und unzuverlässig, und eine dritte Betriebsart würde nur Pflegeaufwand erzeugen.

Voraussetzungen: Docker Desktop (oder ein anderer Docker-Engine-Host) mit Compose v2, für die Entwicklung zusätzlich Node.js 24 (Version aus `.nvmrc`).

## Datenbank

- PostgreSQL läuft nur über `docker compose`, es gibt keine lokale Installation.
- Das Schema liegt in `prisma/schema.prisma`, die Konfiguration (Pfade, `DATABASE_URL`, Seed-Befehl) in `prisma.config.ts`. Änderungen laufen über versionierte Prisma-Migrationen in `prisma/migrations/` (im Git): `prisma migrate dev` in der Entwicklung, `prisma migrate deploy` im `migrate`-Container.
- Seed-Daten: Mock-Daten für Geschäftspartner und Cases kommen per Seed-Skript `prisma/seed.ts` (in `prisma.config.ts` als `migrations.seed: "tsx prisma/seed.ts"` eingetragen). Der Seed läuft nur explizit über `prisma db seed` und ist idempotent (`upsert` mit festen IDs), darf also mehrfach laufen. Der Inhalt wird später definiert.
- Backups sind für den MVP nicht vorgesehen. Reset: `docker compose down -v`, neu starten, Seed ausführen (in der Entwicklung alternativ `npx prisma migrate reset` und danach `npx prisma db seed`).

## Nicht im Scope (MVP)

- Kubernetes sowie produktives Cloud- oder SAP-BTP-Deployment; ein externes Hosting ausschließlich für die Abschlussdemo bleibt als Option offen
- Separates Backend, Microservices, Message Broker
- Hochverfügbarkeit, Backups, Monitoring
- TLS und Reverse Proxy (läuft lokal bzw. in der Demo über HTTP)
- Echter Mailversand (SMTP, Mailserver). Benachrichtigungen werden lediglich als protokollierter Mock beziehungsweise In-App-Aufgabe simuliert.

## Noch offen

- CI (z. B. GitHub Actions für Build und Lint)
- Ziel-Umgebung für die Demo: lokal beim Team oder gehosteter Server
- Infrastruktur-Anteile aus den anderen Themen, sobald konsolidiert:
  - Datenimport
  - Auth und Rollen (inkl. Wahl der Auth-Bibliothek)
