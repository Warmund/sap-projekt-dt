# Entwicklungssetup

Dieses Dokument beschreibt den aktuellen Stand und die Einrichtung auf einem weiteren Rechner. Das Next.js-Grundgerüst aus Issue #51 zeigt bewusst eine vollständig leere Oberfläche. UI5 ist über den ThemeProvider eingebunden.

## Voraussetzungen

- Git und Zugriff auf das Projekt-Repository.
- Node.js 24 LTS mit npm, zum Beispiel von [nodejs.org](https://nodejs.org/). Nach der Installation ein neues Terminal öffnen und mit `node --version` und `npm --version` prüfen.
- Codex CLI für die Arbeit mit Codex und dem MCP-Server.

## Repository und npm-Pakete

Das Repository klonen beziehungsweise auf den aktuellen Stand bringen und im Projektverzeichnis ausführen:

```bash
npm ci
```

Damit werden die Versionen aus `package-lock.json` installiert, darunter `@ui5/webcomponents-react`. `node_modules` wird nicht eingecheckt. Die Paketdateien und Skills müssen erst im verwendeten Branch committed und gepusht sein, bevor sie auf einem anderen Rechner verfügbar sind.

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

## Anwendung starten und prüfen

Mit Node.js 24 im Projektverzeichnis:

```bash
npm ci
npm run dev
```

Die leere Oberfläche ist unter http://localhost:3000 erreichbar. Datenbank und Umgebungsvariablen sind für dieses Grundgerüst nicht erforderlich. Die konkreten Paketversionen sind in der Lockdatei fixiert.

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Der Browser-Test startet selbst einen lokalen Entwicklungsserver und prüft die leere Seite und Laufzeitfehler. Für einen Produktionsstart nach dem Build: `npm start`. Unter Windows kann bei gesperrten PowerShell-Skripten `npm.cmd` beziehungsweise `npx.cmd` verwendet werden.
