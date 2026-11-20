# Project Charter

**Project Name:** Workflow und Datenbank für sanktionierte Geschäftspartner (SAP SE, Export Control)

**Author:** Projektteam der Frankfurt University of Applied Sciences

**Status:** Arbeitsstand, 20.11.2026

## Change log

| Author | Date | Change | Version |
| --- | --- | --- | --- |
| Agent | 20.11.2026 | Verwaltbare Tags für Kunden eingeführt und mehrere Sanktionslisten je Geschäftspartner vorgesehen | 5.14 |
| Agent | 20.11.2026 | SR als SuccessRoom benannt und als reine Kundeninformation in Vorschau und Register angezeigt | 5.13 |
| Agent | 20.11.2026 | Erfassung neuer GTS-Fälle auf Business Partner ID mit schreibgeschützter Vorschau der simulierten Quelldaten umgestellt | 5.12 |
| Agent | 20.11.2026 | Ladeansicht für den Start ergänzt und aktuelle Registeransicht samt ausgewähltem Fall beim Neuladen beibehalten | 5.11 |
| Agent | 20.11.2026 | Drei Berechtigungsgruppen eingeführt. Export Kontrolle kann verwalten und bearbeiten, Display only liest, SCG bestätigt nur IRDP und BCP. | 5.10 |
| Agent | 20.11.2026 | Partner Teams hat wieder eine Auswahl zwischen SCG und Cloud. SCG ist erst nach separater Bestätigung von IRDP und BCP abgeschlossen. | 5.9 |
| Agent | 20.11.2026 | Partner Teams bietet eine Auswahl zwischen SCG und Cloud-Sperre je LoB. Die Anzeige verwendet die Kurzbezeichnung SCG. | 5.8 |
| Agent | 20.11.2026 | Automatischer Abschluss im Register nach Freigabe. Nur SCG und Cloud-Sperre je LoB bleiben manuell bei den Partner Teams. SCG ist erst nach separater Bestätigung von IRDP und BCP abgeschlossen. | 5.7 |
| Agent | 20.11.2026 | ServiceNow in Schritt 4 für offene Support-Tickets aufgenommen und den späteren separaten ServiceNow-Schritt entfernt | 5.6 |
| Agent | 20.11.2026 | Sammelentwürfe für offene Kundenbenachrichtigungen in die Sidebar verschoben, mit Empfängerauswahl und manueller Versandbestätigung | 5.5 |
| Agent | 20.11.2026 | Einheitliche Sperrfolge nach Freigabe mit automatischem Demo-Abschluss für S-User, SHN, RCSC, IRDP, ServiceNow, BCP und Cloud als letztem Schritt | 5.3 |
| Agent | 19.11.2026 | Deutsch und Englisch für die Oberfläche ergänzt. Die Sprache wird in den Einstellungen gewählt und im Browser gespeichert. | 5.2 |
| Agent | 19.11.2026 | Register um auf- und absteigende Sortierung für Kunden, Land, ETS, Sanktionsliste, Cloud, Sperrdatum und Status ergänzt | 5.1 |
| Agent | 19.11.2026 | Register um aufklappbare Filter für Land, ETS, Sanktionsliste, Cloud, GTS-Sperrdatum und Status ergänzt | 5.0 |
| Agent | 19.11.2026 | Vercel-Installationsbefehl versuchsweise auf npm install --no-audit --no-fund umgestellt. Build-Zeit nach dem Wechsel noch zu messen. | 4.9 |
| Agent | 19.11.2026 | Registeransicht auf Suche und Ergebnistabelle reduziert. Erfassung erfolgt über Administration. | 4.8 |
| Agent | 19.11.2026 | „Neuer Datensatz“ in die Sidebar-Gruppe „Administration“ verschoben | 4.7 |
| Agent | 19.11.2026 | Frühere Sidebar wiederhergestellt und Administration ins Profilmenü verschoben | 4.6 |
| Agent | 19.11.2026 | Mobile Registeraktionen umplatziert, Aktionslinks als Buttons ausgezeichnet und Schrittfolge pro Fall mit Sperre nach Entscheidung umgesetzt | 4.5 |
| Agent | 19.11.2026 | UI-Audit dokumentiert Risiken bei mobilen Aktionen, Link-Semantik und der fachlichen Workflow-Steuerung | 4.4 |
| Agent | 19.11.2026 | Node.js für Entwicklung und CI auf das Sicherheitsrelease 24.22.3 angehoben und als Mindestversion hinterlegt | 4.3 |
| Agent | 19.11.2026 | Sidebar nach Arbeitsablauf geordnet und Administration mit Tabs für Sperrfälle, Cloud-Tenants, Länder-Kontakte und Nutzer ergänzt | 4.2 |
| Agent | 19.11.2026 | Home und persönliche Todo-App vollständig entfernt; Dashboard ersetzt Home als oberster Navigationseintrag und Ziel des Logo-Klicks, fachliche Sperraufgaben bleiben im Register | 4.1 |
| Agent | 17.11.2026 | Register-Dashboard als Startansicht angebunden: Kundenbestand unabhängig von Freigabe, historische Jahres-/Monatsauswertung, Aktualisieren und Kacheln mit passenden Registerfiltern | 4.0 |
| Agent | 17.11.2026 | Datenabgleich aller 50 CSV-Zeilen, wiederholbarer Import, Datenbank- und Browser-Tests erfolgreich; vorhandene Next.js-Sicherheitswarnung als offenes technisches Risiko aufgenommen | 3.9 |
| Agent | 17.11.2026 | Kundenregister in bestehender Neon-Datenbank angelegt und 50 Kunden aus bereitgestellter Test-CSV importiert; persistente Registeransichten, Freigaben, Aufgaben und Audit angebunden, fehlende Fachangaben bleiben offen | 3.8 |
| Agent | 13.11.2026 | Vercel meldet GitHub-Repository als öffentlich; frühere Hobby-Beschränkung für private Repositories ist damit für den aktuellen Stand nicht einschlägig | 3.7 |
| Agent | 13.11.2026 | Separate Deployment-Action entfernt und bestehende Vercel-GitHub-Integration reaktiviert; Typecheck/Lint bleibt, Hobby-Autorenbeschränkung besteht fort | 3.6 |
| Agent | 12.11.2026 | Vercel blockiert das CLI-Deployment von Pauls Merge wegen fehlender Autorenberechtigung; Owner-Token allein genügt nicht, nächster Lauf wartet hinter blockiertem Deployment | 3.5 |
| Agent | 12.11.2026 | Automatische Vercel-Git-Deployments über vercel.json deaktiviert; GitHub Actions bleibt der Deployment-Weg, um doppelte Deployments zu vermeiden | 3.4 |
| Agent | 12.11.2026 | Deployment-Action auf jeden Push erweitert: main nach Production, andere Branches als Preview; VERCEL_TOKEN laut Nutzer hinterlegt | 3.3 |
| Agent | 12.11.2026 | Vercel-Projekt per CLI verknüpft und beide Projekt-IDs als GitHub-Secrets hinterlegt; Token-Erstellung durch fehlende Berechtigung der CLI-Anmeldung blockiert | 3.2 |
| Agent | 12.11.2026 | Production-Deployment über GitHub Actions mit Vercel-Token des Projektinhabers vorbereitet; Build in GitHub, Upload als Prebuilt-Artefakt, Secrets und Hobby-Eignung noch zu verifizieren | 3.1 |
| Agent | 30.10.2026 | Die bestehenden vier Demo-Zugänge erhalten vorläufig die technische Admin-Rolle | 3.0 |
| Agent | 30.10.2026 | Technische Admin-Rolle für Nutzerverwaltung mit Nutzerliste und Anlage weiterer Zugänge beschlossen | 2.9 |
| Agent | 30.10.2026 | Next.js- und TypeScript-ESLint-Regeln als ergänzende Prüfung in der GitHub Action festgelegt | 2.8 |
| Agent | 30.10.2026 | GitHub Action für Typecheck bei Push auf main vorgesehen; Vercel-Deployment bleibt unabhängig vom Prüfergebnis | 2.7 |
| Agent | 30.10.2026 | Todo-Demo und Dynamic-Page-Inhalt auf Nutzerwunsch entfernt; oberer Anwendungsbalken bleibt bestehen | 2.6 |
| Agent | 30.10.2026 | Startseite als Fiori Dynamic Page mit persönlicher Todo-Demo, Statusfiltern, Prioritäten und Fortschritt gestaltet; Aufgaben bleiben pro Projektzugang im lokalen Browser, ohne gemeinsame Aufgaben-Datenbank | 2.5 |
| Agent | 30.10.2026 | Login-Gestaltung an SAP-Vorlage angelehnt: SAP-Logo, responsive Anmeldekarte und deaktivierter SSO-Button als Platzhalter; keine SSO-Anbindung im MVP | 2.4 |
| Agent | 30.10.2026 | Neon-Datenbank mit Vercel und lokaler Entwicklung verbunden; Better-Auth-Migration angewendet | 2.3 |
| Agent | 30.10.2026 | Neon-PostgreSQL-Ressource im kostenlosen Tarif eingerichtet; Verbindung und Auth-Migration werden vorbereitet | 2.2 |
| Agent | 30.10.2026 | Better-Auth-Anmeldung und PostgreSQL-Migration vorbereitet; Datenbankeinrichtung und vollständiger Login-Test stehen aus | 2.1 |
| Agent | 30.10.2026 | Better Auth als Authentifizierungsbibliothek für die individuelle Demo-Anmeldung festgelegt | 2.0 |
| Agent | 30.10.2026 | Benutzername und Passwort als Anmeldeverfahren für individuelle Demo-Zugänge festgelegt | 1.9 |
| Agent | 30.10.2026 | Individuelle App-Anmeldung mit Authentifizierungsbibliothek und SAP-nah gestaltetem Login als MVP-Richtung festgehalten; konkrete Bibliothek und Rollen bleiben offen | 1.8 |
| Agent | 16.10.2026 | Template auf das SAP-Projekt angepasst und Projektnamen gesetzt | 0.2 |
| Agent | 23.10.2026 | Technische Randbedingungen, lokalen Docker-Betrieb und Mock-Daten statt GTS-API ergänzt | 0.3 |
| Agent | 23.10.2026 | Nichtziel ergänzt: kein echter E-Mail-Versand im MVP | 0.4 |
| Agent | 25.10.2026 | Meetingrhythmus und Einschränkung für externe Systemabfragen aus dem SAP-Kick-off aufgenommen | 0.5 |
| Agent | 27.10.2026 | Charter anhand aller Mitschriften und Jettes vorgeschlagener Deliverables und Timeline vollständig konsolidiert | 0.6 |
| Agent | 27.10.2026 | Bearbeitbares Architekturdiagramm als Bestandteil der Solution-Design-Dokumentation ergänzt | 0.7 |
| Agent | 29.10.2026 | Vercel Web Analytics für Seitenaufrufe im zentralen Anwendungslayout aufgenommen | 1.7 |
| Agent | 29.10.2026 | Technisches Grundgerüst um UI5-ShellBar mit dem Namen SAP-Project-DT ergänzt; Inhaltsfläche bleibt leer | 1.6 |
| Agent | 29.10.2026 | Issue #51: Next.js-Grundgerüst mit UI5 vorbereitet; Startseite auf Nutzerwunsch vollständig ohne sichtbare Inhalte | 1.5 |
| Agent | 29.10.2026 | Architektur-Spec #50 in vier abhängige Umsetzungstickets #51–#54 aufgeteilt und GitHub-Projekt 2 (sap-project-infra) zugeordnet | 1.4 |
| Agent | 29.10.2026 | Eine gemeinsame Datenbank für Entwicklung und Demo zur Vereinfachung festgelegt; Architektur-Spec vorbereitet | 1.3 |
| Agent | 29.10.2026 | Demo-Zugang ohne Vercel-Konto und automatisches Deployment vom Hauptbranch festgelegt | 1.2 |
| Agent | 29.10.2026 | SAP-Zugriff auf die Demo, getrennte gemeinsame Entwicklungsdatenbank und möglichst kostenlosen Datenbanktarif festgelegt | 1.1 |
| Agent | 29.10.2026 | Demo-Zugriff für ausgewählte Personen und möglichst kostenloser Vercel-Tarif als Architekturziele ergänzt | 1.0 |
| Agent | 29.10.2026 | Vercel und externes PostgreSQL als geplante Demo-Infrastruktur statt Docker Compose festgelegt | 0.9 |
| Agent | 29.10.2026 | Requirements-Backlog als GitHub-Issues und PI-/Sprint-Planung im GitHub-Projekt festgelegt; fachliche Abstimmungsfragen erhalten ein eigenes Label | 0.8 |

## 1 Project Purpose or Justification

SAP Export Control prüft Geschäftspartner gegen relevante Sanktionslisten. Wird ein Geschäftspartner gesperrt, müssen abhängig von Produkten und Verträgen mehrere interne Folgeaktivitäten ausgeführt werden. Die heutige Koordination über E-Mails und getrennte Excel-Dateien verursacht Medienbrüche, unklare Zuständigkeiten, eingeschränkte Transparenz und Risiken für die Datenqualität.

Das Projekt konzipiert und entwickelt einen demonstrierbaren Stand-alone-MVP, der den Workflow der Folgeaktivitäten und ein zentrales Register für sanktionierte Geschäftspartner verbindet. Der MVP soll die fachliche Idee sichtbar und testbar machen und als Grundlage für die Diskussion einer späteren SAP-integrierten Lösung dienen.

### 1.1 Project Statement of Work

Das Projekt umfasst zwei fachliche Säulen:

1. workflowartige Kommunikation zwischen Export Control und beteiligten Teams mit Aufgaben, Benachrichtigungen, Rückmeldungen sowie Transparenz über offene und erledigte Schritte;
2. eine zentrale Datenbank für sanktionierte Geschäftspartner mit Sperrdatum, Sperrgrund, Status, Zuständigkeiten, Suche und Dashboard.

Key Deliverables:

- mit SAP abgestimmtes Processflow-Diagramm;
- Solution Design einschließlich konzeptioneller SAP-Zielanbindung;
- priorisierter Product Backlog;
- implementierte Workflow-Lösung und Datenbank mit synthetischen Mock-Daten;
- Statistik beziehungsweise Dashboard;
- Testfälle, Testergebnisse und dokumentierte Korrekturen;
- technische Dokumentation und Endanwenderdokumentation.

Der MVP verwendet keine echte SAP-GTS-Verbindung und keine echten SAP-, Kunden-, Sanktions- oder personenbezogenen Daten. Eine spätere Integration wird lediglich konzeptionell beschrieben.

### 1.2 Measurable Project Objectives and Related Success Criteria

Das Projekt gilt als erfolgreich, wenn:

- der Processflow die automatischen und manuellen Schritte, Benachrichtigungen, Rückmeldungen, gegebenenfalls erforderliche Vier-Augen-Prüfungen und die Abschlussinformation beschreibt;
- das Solution Design den festgelegten Technologie-Stack, den Stand-alone-MVP und die für eine spätere SAP-Umgebung benötigten Integrationen dokumentiert;
- Workflow und Datenbank mit synthetischen Mock-Daten demonstrierbar implementiert sind;
- offene und erledigte Folgeaktivitäten nachvollziehbar angezeigt und bearbeitet werden können;
- das Dashboard die noch mit SAP zu vereinbarenden Kennzahlen ausgibt; als Beispiele wurden Zeitraum, Sperrgrund und Land genannt;
- definierte Testfälle durchgeführt und ihre Ergebnisse dokumentiert sind;
- technische Dokumentation und Endanwenderdokumentation zum Projektabschluss vorliegen.

Quantitative Zielwerte für Zeitersparnis, Datenqualität oder Kostenreduktion sind bislang nicht vereinbart.

### 1.3 Other Success Criteria

- Der MVP vermittelt ein SAP-nahes und für die Abschlusspräsentation verständliches Zielbild.
- Export Control und beteiligte Teams können Zuständigkeiten und Bearbeitungsstände nachvollziehen.
- Nicht implementierte produktive Integrationen sind klar von der demonstrierten Lösung abgegrenzt.
- Offene fachliche Entscheidungen werden transparent dokumentiert und nicht durch unbelegte Annahmen ersetzt.
- SAP erhält bei der Abschlusspräsentation Gelegenheit zu Feedback.

## 2 Assumptions and Constraints

- Die gemeinsame Umsetzung ist ein schneller, demonstrierbarer MVP beziehungsweise POC, keine produktive SAP-Lösung.
- Neue GTS-Fälle werden über die Business Partner ID gesucht. Das Register zeigt Quelldaten vor dem Anlegen zur Vier-Augen-Freigabe schreibgeschützt an. Der MVP simuliert den Abruf mit zwei Testfällen. SuccessRoom ist ein verwaltbares Tag und ändert weder Freigabe noch Sperrschritte. Export Kontrolle kann Tags in den Stammdaten anlegen und Kunden zuordnen. Geschäftspartner können mehreren Sanktionslisten angehören. Die spätere Anbindung an SAP GTS wird im Solution Design betrachtet.
- Es werden ausschließlich synthetische Mock-Daten verwendet.
- Der technische Stack ist Next.js 16 mit TypeScript, UI5 Web Components for React, Prisma 7 und PostgreSQL 18.
- Die Internet-Demo soll dem Projektteam und ausgewählten SAP-Ansprechpersonen zugänglich sein; Vercel soll möglichst im kostenlosen Tarif genutzt werden. Ein Vercel-Konto darf für Besucher nicht erforderlich sein; die konkrete Zugriffsschutzlösung ist offen. Änderungen am Hauptbranch sollen automatisch deployt werden.
- Die Oberfläche des MVP ist auf Deutsch und Englisch verfügbar. Die Sprachwahl gilt pro Browser und ist auch vor der Anmeldung verfügbar.
- Für den MVP ist eine individuelle App-Anmeldung mit Benutzername und Passwort, Better Auth und einer SAP-nah gestalteten Login-Oberfläche mit SAP-Logo und responsiver Anmeldekarte vorgesehen. Ein deaktivierter SSO-Button dient als sichtbarer Platzhalter ohne Funktion. Echtes SAP-SSO bleibt eine spätere Integrationsmöglichkeit.
- Home und die persönliche Todo-App sind entfernt. Das Register-Dashboard ist Startansicht und oberster Navigationseintrag; ein Klick auf das Logo führt ebenfalls dorthin. Fachliche Sperrschritte bleiben Bestandteil des Registers.
- GitHub Actions prüft TypeScript und ESLint bei Push auf `main`. Deployments erfolgen unabhängig davon über die bestehende Vercel-GitHub-Integration mit `Warmund/sap-projekt-dt`: `main` nach Production, andere Branches als Preview. Die separate Deployment-Action wurde entfernt und `git.deploymentEnabled` wieder aktiviert. Die dafür zuvor angelegten GitHub-Secrets werden nicht mehr benötigt.
- Alle angemeldeten Nutzer können das Register und die Nutzerliste lesen. Die Gruppe Export Kontrolle darf Daten, Prozessschritte und Zugänge verwalten. Display only hat ausschließlich Lesezugriff. SCG (Support Compliance Group) kann zusätzlich IRDP und BCP unter Partner Teams bestätigen.
- Bestehende technische Admin-Zugänge behalten ihre Rechte als Export Kontrolle. Bisherigen Standardzugängen wird Display only zugeordnet.
- Die Demo wird direkt auf Vercel mit extern verwaltetem PostgreSQL geplant. Eine Neon-Ressource im kostenlosen Tarif wurde mit dem Vercel-Projekt `project-dt-sap` und der lokalen Entwicklung verbunden; die Better-Auth-Migration wurde angewendet. Entwicklung und Demo nutzen eine einzige gemeinsame Datenbank; Schemaänderungen und Resets werden im Team abgestimmt.
- Das Sanktionsregister wird seit 17.11.2026 in derselben Neon-Datenbank wie die Anmeldung gespeichert. Die bereitgestellte Kunden-Test-CSV liefert 50 Datensätze mit 13 Spalten. CRM wird für die bestehende BP-ID-Ansicht verwendet; diese fachliche Zuordnung bleibt zu bestätigen. Nicht enthaltene Freigaben, Tenant-IDs, konkrete Sanktionslisten und verantwortliche Personen werden nicht erfunden. Der Import setzt keine Aufgabenerledigung voraus. Mapping und Importnachweise stehen in `docs/kundenimport.md`.
- Die Administration ist über das Profilmenü erreichbar und bündelt geplante Datenprodukte für GTS-Sperrfälle und Cloud-Tenants. Die Pflege der Länder-Kontakte bleibt bis zur Klärung von Quelle und Zugriff manuell. Änderungen an Zugängen sind der Gruppe Export Kontrolle vorbehalten.
- Das Dashboard ist die Startansicht nach der Anmeldung. Bestandskennzahlen berücksichtigen alle Kunden, Workflowkennzahlen ausschließlich tatsächlich freigegebene Schritte. Historische Sperrdaten werden nach Jahr beziehungsweise Monat ausgewertet; Kacheln öffnen die passende Registerauswahl. Andere Nutzeränderungen können mit „Daten aktualisieren“ nachgeladen werden. Beim Neuladen im Browser bleibt die geöffnete Ansicht einschließlich eines ausgewählten Falls erhalten.
- Vier-Augen-Prüfung neuer Registereinträge und Versionsprüfung bei konkurrierenden Änderungen werden serverseitig durchgesetzt. Der Server prüft die Gruppenberechtigung für jede Registeränderung.
- Es gilt eine feste Folge nach der Vier-Augen-Freigabe: S-User (automatischer Abschluss im MVP), offene Support-Tickets in ServiceNow prüfen und schließen, danach SHN aktivieren, I7P Control Table Board in RCSC bearbeiten, Benachrichtigung, SCG mit IRDP-Flag im Launchpad und BCP-Ticket und zuletzt Cloud-Sperre je LoB für Cloud-Kunden. Nur SCG und Cloud-Sperre je LoB bleiben manuell bei den Partner Teams. SCG ist erst nach separater Bestätigung von IRDP und BCP abgeschlossen. Das Register schließt alle anderen Schritte nach Freigabe automatisch ab. Partner Teams bietet eine Auswahl zwischen SCG und Cloud-Sperre je LoB. Die tatsächliche Ausführung in externen Systemen bleibt außerhalb der Demo.
- Unter „Benachrichtigungen“ können mehrere Kunden mit Freigabe und ausstehendem E-Mail-Versand und Empfänger aus einer festen Liste für einen gemeinsamen E-Mail-Entwurf ausgewählt werden. Der Versand erfolgt außerhalb des MVP im eigenen E-Mail-Programm. Die manuelle Versandbestätigung entfernt die Kunden aus der offenen E-Mail-Liste.
- Kubernetes, SAP BTP, Microservices, Hochverfügbarkeit, Backups und Betriebsmonitoring sind nicht Bestandteil des MVP. Vercel Web Analytics wird für Seitenaufrufe eingebunden.
- Externe Systemabfragen sind laut Kick-off nur zulässig, wenn Informationen nicht auf SAP zurückgeführt werden können; die konkrete Auslegung muss SAP noch klären.
- Jettes Timeline ist eine Planungsbaseline und ausdrücklich nicht als unveränderlicher harter Terminplan zu verstehen.
- Das voraussichtliche Projektende Ende Januar 2027 muss noch bestätigt werden.

## 3 Business Case

Das Vorhaben adressiert eine organisatorische und regulatorische Notwendigkeit. Sanktionierte Geschäftspartner dürfen abhängig vom jeweiligen Fall nicht weiter beliefert oder vertraglich bedient werden. Die erforderlichen Folgeaktivitäten betreffen mehrere Teams, werden heute aber überwiegend per E-Mail und über getrennte Excel-Dateien koordiniert.

Ein zentrales Register mit Workflowunterstützung soll:

- den Bearbeitungsstand transparent machen;
- Zuständigkeiten und offene Aufgaben sichtbar halten;
- Medienbrüche und manuelle Abstimmung reduzieren;
- die Aktualität und Vollständigkeit der Informationen verbessern;
- Account Executives und beteiligte Teams auskunftsfähiger machen;
- eine spätere Automatisierung und SAP-Integration fachlich vorbereiten.

Schätzungen zu monetärem Nutzen, Projektkosten und späteren Betriebskosten liegen noch nicht vor. Für öffentliches Demo-Hosting wurden in einer Recherche je nach Anbieter kostenlose bis kostenpflichtige Varianten untersucht; eine Entscheidung wurde nicht getroffen.

## 4 High-level Risks

| Risiko | Auswirkung |
| --- | --- |
| Processflow, Automatisierungsgrad und Vier-Augen-Prinzip sind noch nicht abgestimmt | Unvollständige oder falsche Workflowimplementierung |
| Beteiligte Teams und Empfängergruppen sind nicht vollständig bekannt | Lücken in Aufgabenverteilung und Kommunikation |
| ETS-Kategorien, Statuswerte und Berechtigungen sind noch nicht spezifiziert | Nacharbeit an Datenmodell, UI und Autorisierung |
| Änderungen oder Resets der gemeinsamen Datenbank beeinträchtigen die Demo | Entwicklungsarbeiten und Vorführungen müssen abgestimmt werden |
| MVP und spätere GTS-Zielarchitektur werden verwechselt | Falsche Erwartungen an Funktionsumfang und Integrationsgrad |
| Ausgangsdaten aus mehreren Excel-Dateien sind nicht zuverlässig | Schwache Datenqualität und unklare fachliche Regeln |
| Umgang mit SAP-stämmigen Informationen in externen Systemen ist nicht geklärt | Datenschutz-, Vertraulichkeits- und Freigaberisiko |
| Hostingentscheidung steht aus | Späte technische Anpassungen, Kosten oder Betriebsaufwand |
| Patchstand der von Vercel verwalteten Node.js-24-Runtime noch nicht verifiziert | Sicherheitskorrekturen in Produktion nach dem nächsten Deployment anhand der Runtime-Version prüfen |
| Build meldet bekannte Sicherheitslücke der installierten Next.js-Version 16.4.3 | Sicherheitsupdate der Framework-Version prüfen und gesondert durchführen |
| CRM-ID aus CSV ist noch nicht fachlich als GTS-BP-ID bestätigt; Freigaben, konkrete Listen und Tenant-Daten fehlen | Zuordnung und fehlende Informationen mit SAP prüfen; importierte Fälle bleiben zur Prüfung, Cloud-Abschluss ohne Tenants ist gesperrt |
| Repository wird von Vercel als öffentlich gemeldet; spätere Umstellung auf privat würde die Hobby-Autorenbeschränkung wieder relevant machen | Sichtbarkeit bewusst verwalten; ausschließlich synthetische Mock-Daten und keine Secrets im Repository |
| Softwareentwicklung hat noch nicht begonnen | Terminrisiko für Implementierung, Test und Dokumentation bis Ende Januar |
| Projektende und Abnahmerollen sind nicht bestätigt | Unsicherheit bei Planung und formaler Abnahme |

## 5 Stakeholders and Governance

### 5.1 Project Sponsor

Der Project Sponsor ist noch nicht benannt. SAP SE, Export Control ist Projektpartner und primärer fachlicher Nutznießer.

### 5.2 Project Owner

Der für IT-Themen verantwortliche Project Owner ist noch nicht benannt. Für eine spätere produktive Lösung müssen SAP-GTS-, Integrations-, Security-, Datenschutz- und Betriebsverantwortliche eingebunden werden.

### 5.3 Project Manager(s)

Die Projektleitung und eine mögliche Trennung zwischen fachlicher und technischer Projektleitung sind noch nicht dokumentiert.

### 5.4 Other Relevant Stakeholders

- SAP-Kontakte: Jette Bork-W., Tobias Bahr und Nina S. Hahn;
- Export Control;
- betroffene Fach-, Produkt- und Cloud-Teams;
- Teams für S-User beziehungsweise Service-Portal-Zugänge;
- Account Executives;
- Data Quality; in einer Mitschrift wird Natascha genannt, genaue Rolle und Nachname sind offen;
- SAP GTS und später zu beteiligende IT-/Integrationsteams;
- Projektteam der Frankfurt University of Applied Sciences;
- sanktionierte Geschäftspartner als indirekt Betroffene.

### 5.5 Project Governance

- Das Projektteam trifft sich jeden zweiten Freitag vor Ort bei SAP.
- In den dazwischenliegenden Wochen findet ein Online-Termin statt.
- Der Processflow wird gemeinsam mit SAP erarbeitet.
- Jette hat einen Donnerstags-Call zur Detailabstimmung und eine Präsentation am darauffolgenden Freitag angekündigt; konkrete Daten sind nicht dokumentiert.
- Die Abschlusspräsentation findet bei SAP mit anschließender Feedbackrunde statt.
- Projektentscheidungen und Änderungen werden in einem Entscheidungslog dokumentiert.
- Freigabegremium, formale Abnahme und Rollenverteilung sind noch zu klären.

## 6 High Level Milestone Plan

Die folgende Timeline wurde von Jette als unverbindlicher Vorschlag und Anhaltspunkt übermittelt. Die Jahreszahlen ergeben sich aus dem Projektstart im Oktober 2026.

| Project Phase | Start | End |
| --- | --- | --- |
| Initialization und SAP-Kick-off | 23.10.2026 | 23.10.2026 |
| Prozessklärung und Processflow | Noch festzulegen | Mitte November 2026 |
| Solution Design und Product Backlog | Noch festzulegen | Anfang Dezember 2026 |
| Implementierung von Workflow und Datenbank | Noch festzulegen | Ende Januar 2027 |
| Tests und Korrekturen | Noch festzulegen | Ende Januar 2027 |
| Statistik und Dashboard | Noch festzulegen | Ende Januar 2027 |
| Technische und Endanwenderdokumentation | Noch festzulegen | Voraussichtlich Ende Januar 2027 |
| Abschlusspräsentation und Feedback | Noch festzulegen | Voraussichtlich Ende Januar 2027 |

## 7 Project Team

### 7.1 Organization Chart

Eine verbindliche Organisation und Berichtsstruktur ist noch nicht dokumentiert. Fachlich arbeitet das Hochschul-Projektteam mit SAP Export Control zusammen. Eine Mitschrift nennt Lisa und Max als Projektmitarbeitende; die Zuordnung und vollständige Teamliste sind noch zu bestätigen.

### 7.2 Pre-assigned Resources

Belastbare FTE-Angaben und Einsatzzeiträume liegen nicht vor.

| Name/Gruppe | Organisation | Rolle | Zeitraum | FTE |
| --- | --- | --- | --- | --- |
| Projektteam | Frankfurt University of Applied Sciences | Konzeption und Umsetzung | Oktober 2026 bis voraussichtlich Januar 2027 | Noch offen |
| Jette Bork-W., Tobias Bahr, Nina S. Hahn | SAP SE | Fachliche Kontakte | Projektlaufzeit | Noch offen |
| Lisa und Max | Noch zu bestätigen | Laut Mitschrift Projektmitarbeitende | Noch zu bestätigen | Noch offen |

## 8 Other Agreements

- Zentrale konsolidierte Informationsbasis ist `docs/projektkonzept.md`.
- GitHub Issues im Repository `patrick-pag/sap-projekt-dt` dienen als Issue- und Spezifikationsablage.
- Das GitHub-Projekt `patrick-pag/projects/1` ist die operative PI-/Sprint-Planung: PI 1 enthält die sechs Sprints SPR-01 bis SPR-06. Einträge, die in SAP-Calls fachlich geklärt werden müssen, tragen das Label `fachliche-frage`.
- Ausführliche technische Planung bleibt in `docs/infrastructure.md` dokumentiert.
- Hostingoptionen und Preisstände sind in `docs/research/hosting-mvp-2026-10-25.md` dokumentiert.
- Anforderungen, die weder aus SAP-Input noch aus vorhandenen Projektquellen hervorgehen, bleiben offen und werden nicht erfunden.

## 9 Project authorization

Diese Charter beschreibt und legitimiert den derzeit bekannten Arbeitsumfang des Projekts „Workflow und Datenbank für sanktionierte Geschäftspartner“. Eine formale Autorisierung durch benannte Sponsor-, Owner- und Projektleitungsrollen ist noch ausstehend.

Die Umsetzung erfolgt auf Grundlage des abgestimmten Processflows, des Solution Designs und des Product Backlogs. Anwendbare SAP- beziehungsweise Hochschulrichtlinien, Budget, Ressourcenplanung, Qualitätsgrenzen und formale Abnahmebedingungen sind noch zu klären.

| Role | Name | Date | Signature |
| --- | --- | --- | --- |
| Project Sponsor | Noch nicht benannt | Offen | Offen |
| Project Owner | Noch nicht benannt | Offen | Offen |
| Project Manager (IT) | Noch nicht benannt | Offen | Offen |
| Product Owner (BU) | Noch nicht benannt | Offen | Offen |
