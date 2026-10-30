# Entwicklungssetup

Dieses Dokument beschreibt den aktuellen Stand und die Einrichtung auf einem weiteren Rechner. Das Next.js-Grundgerüst aus Issue #51 zeigt einen UI5-ShellBar-Header mit dem Namen „SAP-Project-DT“ über einer leeren Inhaltsfläche. UI5 ist über den ThemeProvider eingebunden.

## Voraussetzungen

- Git und Zugriff auf das Projekt-Repository.
- Node.js 24 LTS mit npm, zum Beispiel von [nodejs.org](https://nodejs.org/). Nach der Installation ein neues Terminal öffnen und mit `node --version` und `npm --version` prüfen.
- Codex CLI für die Arbeit mit Codex und dem MCP-Server.

## Repository und npm-Pakete

Das Repository klonen beziehungsweise auf den aktuellen Stand bringen und im Projektverzeichnis ausführen:

```bash
npm ci
```

Damit werden die Versionen aus `package-lock.json` installiert, darunter `@ui5/webcomponents-react` und `@ui5/webcomponents-fiori` für die ShellBar sowie `@vercel/analytics`. Analytics ist im zentralen Next.js-Layout eingebunden und wird mit `npm ci` ebenfalls installiert. `node_modules` wird nicht eingecheckt. Die Paketdateien und Skills müssen erst im verwendeten Branch committed und gepusht sein, bevor sie auf einem anderen Rechner verfügbar sind.

## Skills

Die folgenden Skills liegen im Repository unter `.agents/skills` und kommen beim Klonen oder Aktualisieren mit:

- `sap-fiori-guidelines`: SAP-Fiori-Designrichtlinien, aus [SAP/ai-skills-library](https://github.com/SAP/ai-skills-library/tree/main/skills/sap-fiori-guidelines).
- `react-best-practices`: React- und Next.js-Empfehlungen, aus [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).

Codex im Projektverzeichnis starten beziehungsweise eine neue Sitzung öffnen, damit neue Skills erkannt werden. Eine separate npm-Installation der Skills ist nicht nötig.

## UI5-React-MCP-Server für Codex

Der MCP-Server ist eine **globale Codex-Einstellung pro Rechner** und wird nicht durch das Klonen übernommen. Unter Windows im Terminal einmal ausführen:

```powershell
codex mcp add ui5-wcr -- npx.cmd -y @ui5/webcomponents-react-mcp@latest
codex mcp get ui5-wcr
```

Auf macOS oder Linux im ersten Befehl `npx` statt `npx.cmd` verwenden. Der Server wird beim Start über npm geladen; dafür muss Node.js im `PATH` verfügbar sein. Codex anschließend neu starten. Der Server liefert Dokumentation und APIs für UI5 Web Components for React. `@latest` kann eine andere Version als das Projektpaket liefern; bei Bedarf lässt sich die Serverversion an die installierte UI5-React-Version anpassen.

Ein Next.js-DevTools-MCP-Server ist bisher nicht eingerichtet.

## Vercel für Codex einrichten

Diese Einrichtung erfolgt **einmal pro Laptop und Benutzerprofil**. CLI, Plugin, MCP-Konfiguration und Anmeldungen werden nicht mit dem Repository übertragen. Grundlage ist die [offizielle Vercel-Setup-Anleitung](https://vercel.com/get-started.md).

### 1. Vercel CLI installieren und anmelden

```powershell
npm.cmd install --global vercel@latest
vercel --version
vercel login
vercel whoami
```

Den von `vercel login` ausgegebenen Link im Browser öffnen und die Anmeldung mit dem gewünschten Vercel-Konto abschließen. `vercel whoami` muss danach den eigenen Benutzernamen anzeigen. Falls `vercel` nach der Installation nicht gefunden wird, ein neues Terminal öffnen; unter Windows kann auch `vercel.cmd` verwendet werden.

### 2. Vercel-Plugin für Codex installieren

```powershell
npx.cmd --yes plugins add vercel/vercel-plugin --target codex --scope user --yes
```

Das Plugin wird für Codex im Benutzerprofil installiert und liefert Vercel-Anleitungen und Befehle wie den Status-Befehl. Es muss nicht zusätzlich als Sammlung globaler Standalone-Skills installiert werden. Die bereits im Repository enthaltenen React- und Fiori-Skills bleiben verfügbar.

### 3. Offiziellen Vercel-MCP-Server verbinden

Zunächst vorhandene Einträge prüfen:

```powershell
codex mcp list
```

Falls `vercel` noch fehlt:

```powershell
codex mcp add vercel --url https://mcp.vercel.com
```

Die OAuth-Anmeldung im Browser abschließen. Falls der Server bereits existiert, aber noch nicht angemeldet ist:

```powershell
codex mcp login vercel
```

Danach prüfen:

```powershell
codex mcp get vercel
codex mcp list
```

Der Eintrag muss aktiviert sein und auf `https://mcp.vercel.com` zeigen. Die Konfiguration liegt im Codex-Benutzerprofil, üblicherweise unter `~/.codex/config.toml`; andere MCP-Einträge bleiben erhalten. CLI und MCP benötigen jeweils ihre eigene Anmeldung. Zugangsdaten und OAuth-Tokens gehören nicht ins Repository.

### 4. Codex neu starten und Zugriff testen

Codex vollständig neu starten, damit Plugin und MCP-Werkzeuge geladen werden. Anschließend beispielsweise anfragen: „Suche in der Vercel-Dokumentation und liste meine Vercel-Teams auf.“ Damit werden sowohl Dokumentationszugriff als auch der authentifizierte Zugriff geprüft. Änderungen über MCP weiterhin vor der Ausführung bestätigen lassen.

Auf macOS/Linux in den obigen Befehlen `npm` und `npx` statt `npm.cmd` und `npx.cmd` verwenden.

### Verifizierter Stand auf dem ersten Laptop

- Vercel CLI **65.8.0**, angemeldet als `patrickradau-6938`.
- Vercel-Plugin im Benutzerprofil installiert und aktiviert; der Status-Befehl ist in den installierten Plugin-Dateien vorhanden.
- Globaler Vercel-MCP-Eintrag aktiviert, OAuth-Anmeldung erfolgreich.
- Der authentifizierte MCP-Test zum Auflisten der Teams steht nach dem Codex-Neustart noch aus.
- Bei diesem Setup wurde kein Vercel-Projekt erstellt, verknüpft oder deployt. Die Einrichtung der Agent-Werkzeuge und das Deployment der Anwendung sind separate Schritte.

## Anwendung starten und prüfen

Mit Node.js 24 im Projektverzeichnis:

```bash
npm ci
npm run dev
```

Die Anwendung ist unter http://localhost:3000 erreichbar. Für die Anmeldung sind eine PostgreSQL-Datenbank und die folgenden Umgebungsvariablen erforderlich. Die konkreten Paketversionen sind in der Lockdatei fixiert.

## Demo-Login einrichten

Die gemeinsame PostgreSQL-Datenbank muss zuerst bereitgestellt werden. `.env.example` nach `.env` kopieren und `DATABASE_URL`, `BETTER_AUTH_URL` und ein zufälliges `BETTER_AUTH_SECRET` mit mindestens 32 Zeichen setzen; dieselben Werte für das Deployment geschützt in Vercel hinterlegen. Zugangsdaten und Secrets niemals einchecken. Auf Vercel muss `BETTER_AUTH_URL` auf die tatsächliche HTTPS-Adresse der Demo zeigen.

Anschließend die versionierte Migration gezielt auf die gemeinsame Datenbank anwenden:

```bash
npx prisma migrate deploy
```

Ein Demo-Konto wird ausschließlich lokal durch ein Teammitglied angelegt. Vor `npm run create-demo-user` die Umgebungsvariablen `DEMO_USERNAME`, `DEMO_NAME`, `DEMO_EMAIL` und `DEMO_PASSWORD` im Terminal setzen; Better Auth benötigt beim Anlegen auch Name und E-Mail. Für die Demo synthetische Werte verwenden. Kein öffentliches Registrierungsformular ist aktiviert. Zur Anmeldung werden Benutzername und Passwort benötigt. Zugangsdaten sicher übermitteln und nach der Einrichtung aus der Terminalumgebung entfernen. Zum Entziehen den Benutzer über die Datenbankverwaltung löschen; dabei werden seine Sitzungen entfernt.

Entwicklung und Demo verwenden dieselbe Datenbank. Migrationen, Benutzeränderungen und Resets müssen im Team abgestimmt werden. Die Einrichtung der Datenbank, das Anlegen eines Demo-Kontos und ein vollständiger Login-Test stehen noch aus.

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Der Browser-Test startet selbst einen lokalen Entwicklungsserver und prüft den Anwendungstitel im Header, die leere Inhaltsfläche und Laufzeitfehler. Für einen Produktionsstart nach dem Build: `npm start`. Unter Windows kann bei gesperrten PowerShell-Skripten `npm.cmd` beziehungsweise `npx.cmd` verwendet werden.
