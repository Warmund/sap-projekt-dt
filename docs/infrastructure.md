# Infrastruktur

> Status: Entwurf. Gilt für den MVP bzw. POC. Inhaltliche Themen (Workflow, Domänenmodell, Mail, Import, Auth) werden in `docs/projektkonzept.md` konsolidiert. Das Deployment auf Vercel ist geplant.

## Rahmen der Architektur

- Ziel ist eine vorführbare MVP-Demo mit ausschließlich synthetischen Daten; eine produktive SAP-Umgebung ist nicht Gegenstand der Umsetzung.
- Die Demo soll über das Internet für das Projektteam und ausgewählte SAP-Ansprechpersonen selbstständig zugänglich sein. Ein Vercel-Konto darf für den Demo-Zugriff nicht vorausgesetzt werden. Die konkrete Zugriffsschutzlösung ist noch offen.
- Vercel soll möglichst im kostenlosen Tarif genutzt werden; Eignung und Grenzen sind vor der Einrichtung zu prüfen.
- Eine einzige gemeinsame Datenbank für Entwicklung und Demo ist vorgesehen; Schemaänderungen und das Zurücksetzen von Testdaten wirken auf beide Nutzungen und erfordern Abstimmung. Auch die Datenbank soll möglichst einen kostenlosen Tarif nutzen.

## Entscheidungen

| Bereich | Entscheidung |
|---|---|
| Architektur | Fullstack-Anwendung mit **Next.js** (App Router, TypeScript). Kein separates Backend. |
| UI | **UI5 Web Components for React** (`@ui5/webcomponents-react`), SAP Design System (Fiori) |
| API | Next.js Route Handlers und Server Actions |
| ORM | **Prisma** (Schema, Migrationen, generierte Typen) |
| Authentifizierung | **Better Auth**; individuelle Demo-Anmeldung mit Benutzername und Passwort |
| Datenbank | **PostgreSQL** bei Neon; Ressource `sap-project-dt-db` im kostenlosen Tarif mit Vercel-Projekt `project-dt-sap` verbunden, Better-Auth-Migration angewendet |
| Betrieb / Deployment | Direktes Deployment auf Vercel; PostgreSQL bei einem externen Anbieter |
| Entwicklung | App lokal mit `npm run dev`, gemeinsame Datenbank für Entwicklung und Demo |

## Versionen

Major-Versionen werden festgelegt und nur bewusst angehoben. Exakte Versionen stehen im Lockfile.

| Komponente | Version | Festgelegt in |
|---|---|---|
| Node.js | 24 (LTS) | `.nvmrc`, `engines` in `package.json` |
| Paketmanager | npm (liegt Node bei) | `package-lock.json` und `npm ci` sind geplant |
| Next.js | 16 | `package.json` |
| Prisma ORM | 7 | `package.json` (`prisma`, `@prisma/client`, `@prisma/adapter-pg`) |
| PostgreSQL | 18 | Anbieter und verfügbare Version noch prüfen |

Relevante Konventionen dieser Versionen:

- **Next.js 16:** Die frühere `middleware.ts` heißt `proxy.ts`.
- **Prisma 7:** Die DB-Verbindung steht in `prisma.config.ts`, nicht mehr in `schema.prisma`. Der Client wird mit dem Generator `prisma-client` in einen festen Ordner erzeugt (`lib/generated/prisma`, nicht im Git) und verbindet sich über den Driver-Adapter `@prisma/adapter-pg`. Prisma lädt `.env` nicht mehr selbst; `prisma.config.ts` importiert dafür `dotenv/config`. Seeds laufen nur noch explizit über `prisma db seed`.

## Begründung der Fullstack-Entscheidung

- Ein Projekt und gemeinsame Typen für UI und API. Es gibt kein CORS, keine Cookie-Verdrahtung zwischen zwei Diensten und keinen doppelten API-Client.
- Better Auth ist für die Anmeldung vorgesehen. Rollen und deren serverseitige Prüfung werden noch fachlich geklärt. Eine spätere SAP-SSO-Anbindung über OIDC ist zu prüfen; ihr genauer Integrationsaufwand ist noch offen.
- Dashboard, Suche, Mock-Mail, Import und Workflow-Aktionen sind alle mit Server Components, Route Handlers und Server Actions abbildbar.
- Wird direkt auf Vercel deployt; serverseitige Funktionen laufen auf Vercel.
- Eine Trennung in Frontend und API lohnt sich erst, wenn mehrere Clients die API nutzen oder SAP einen eigenen Backend-Dienst (z. B. auf BTP) verlangt. Beides ist aktuell nicht gefordert.

## Überblick

Das bearbeitbare Architekturdiagramm liegt unter [`docs/architektur-mvp.drawio`](architektur-mvp.drawio). Durchgezogene Verbindungen stellen den MVP dar; gestrichelte Verbindungen zeigen spätere Integrationsmöglichkeiten außerhalb des MVP.

```
Browser ──HTTPS──► Next.js auf Vercel ──► externes PostgreSQL
                                      ▲
            Migration und Seed ───────┘
```

Der Browser spricht nur mit der Next.js-App. Nur der Server-Teil der App greift über Prisma auf die Datenbank zu.

## Deployment und Entwicklung

Änderungen am Hauptbranch sollen automatisch das Demo-Deployment auf Vercel auslösen.

Die Next.js-Anwendung wird über [`.github/workflows/deploy-vercel.yml`](../.github/workflows/deploy-vercel.yml) in GitHub Actions gebaut und als fertiges Artefakt auf Vercel deployt. Der Workflow läuft bei jedem Push sowie manuell über „Run workflow“, unabhängig von der bestehenden Typecheck-/Lint-Action. `main` deployt nach Production, andere Branches als Preview. Route Handlers und Server Actions laufen dort als Vercel Functions. PostgreSQL liegt bei Neon. Zugangsdaten werden als Vercel-Umgebungsvariablen gepflegt, getrennt für Production und Preview. Die lokale Entwicklung nutzt dieselbe Datenbank wie die Demo und startet mit `npm run dev`. Secrets gehören nicht ins Repository.

### GitHub Actions für Vercel einrichten

Unter GitHub → Settings → Secrets and variables → Actions diese Repository-Secrets anlegen:

| Secret | Wert |
|---|---|
| `VERCEL_TOKEN` | Vercel-Token des Projektinhabers aus den Account Settings → Tokens |
| `VERCEL_ORG_ID` | `orgId` aus `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` aus `.vercel/project.json` für `project-dt-sap` |

Die IDs lassen sich lokal mit `npx vercel link` ermitteln; dabei das bestehende Projekt `project-dt-sap` auswählen. `.vercel/` ist vom Git ausgeschlossen. Den Token nur als GitHub-Secret speichern, nicht im Repository oder in Logs.

Der Workflow lädt mit `vercel pull` die Vercel-Konfiguration und Umgebungsvariablen des Ziels, baut mit `vercel build` (einschließlich Dependency-Installation und `postinstall: prisma generate`) und deployt mit `vercel deploy --prebuilt`. Auf `main` verwendet er die Production-Umgebung und `--prod`, auf anderen Branches die Preview-Umgebung ohne `--prod`. `DATABASE_URL`, `BETTER_AUTH_SECRET` und `BETTER_AUTH_URL` müssen im Vercel-Projekt für Production und Preview gesetzt sein. Migrationen führt diese Action nicht aus.

Die automatischen Deployments der Vercel-Git-Integration werden über `git.deploymentEnabled: false` in der versionierten `vercel.json` deaktiviert, damit Pushes ausschließlich über GitHub Actions deployen. CLI-Deployments bleiben möglich. Diese Einstellung gilt für Branches, die diese Konfiguration enthalten. Das Deployment verwendet die Berechtigung des Token-Inhabers; es gewährt anderen keinen eigenen Vercel-Teamzugang. Ob fremde Commit-Autoren im privaten Repository im Hobby-Tarif akzeptiert werden, muss beim ersten entsprechenden Lauf geprüft werden; die Action garantiert keine Aufhebung der Tarifbeschränkung.

Anleitung: [Vercel: GitHub Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel).

Prisma 7 benötigt bei jedem Deployment eine Client-Generierung, beispielsweise über `postinstall: prisma generate`. Versionierte Migrationen werden vor dem Anwendungsdeployment gezielt gegen die jeweilige Datenbank mit `npx prisma migrate deploy` ausgeführt, etwa aus CI oder manuell; der genaue Ablauf ist bei der Implementierung festzulegen. Mock-Daten werden nur bei Bedarf explizit mit `npx prisma db seed` geladen. Falls Preview-Deployments aktiviert werden, verwenden sie dieselbe Datenbank; automatische Migrationen und Resets aus Preview-Builds sind zu vermeiden. Für serverlose Zugriffe sind Verbindungs-Pooling und Verbindungslimits des gewählten Datenbankanbieters zu berücksichtigen.

Für den MVP werden ausschließlich synthetische Daten verwendet. Kosten, Tarifbedingungen, Zugriffsschutz und Datenbankanbieter sind vor der Einrichtung zu prüfen. Die Architektur und alle genannten Befehle sind Planung; die Anwendung und das Deployment sind noch nicht implementiert.

Quellen: [Vercel: PostgreSQL](https://vercel.com/docs/postgres), [Prisma: Vercel-Integration](https://www.prisma.io/docs/guides/postgres/vercel).
