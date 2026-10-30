# Project Charter

**Project Name:** Workflow und Datenbank für sanktionierte Geschäftspartner (SAP SE, Export Control)

**Author:** Projektteam der Frankfurt University of Applied Sciences

**Status:** Arbeitsstand, 27.10.2026

## Change log

| Author | Date | Change | Version |
| --- | --- | --- | --- |
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
- Es gibt im MVP keine API-Verbindung zu SAP GTS; eine spätere Verbindung wird im Solution Design betrachtet.
- Es werden ausschließlich synthetische Mock-Daten verwendet.
- Der technische Stack ist Next.js 16 mit TypeScript, UI5 Web Components for React, Prisma 7 und PostgreSQL 18.
- Die Internet-Demo soll dem Projektteam und ausgewählten SAP-Ansprechpersonen zugänglich sein; Vercel soll möglichst im kostenlosen Tarif genutzt werden. Ein Vercel-Konto darf für Besucher nicht erforderlich sein; die konkrete Zugriffsschutzlösung ist offen. Änderungen am Hauptbranch sollen automatisch deployt werden.
- Für den MVP ist eine individuelle App-Anmeldung mit Benutzername und Passwort, Better Auth und einer SAP-nah gestalteten Login-Oberfläche mit SAP-Logo und responsiver Anmeldekarte vorgesehen. Ein deaktivierter SSO-Button dient als sichtbarer Platzhalter ohne Funktion. Echtes SAP-SSO bleibt eine spätere Integrationsmöglichkeit.
- Die Startseite zeigt vorerst nur den oberen Anwendungsbalken; die Todo-Demo wurde auf Nutzerwunsch entfernt.
- GitHub Actions prüft TypeScript und ESLint bei Push auf `main`. Das Vercel-Deployment läuft unabhängig vom Ergebnis; ein zusätzlicher Build in GitHub Actions ist nicht vorgesehen.
- Eine technische Admin-Rolle darf Nutzer auflisten und weitere Demo-Zugänge einschließlich ihrer Rolle anlegen. Fachliche Rollen und Berechtigungen bleiben gesondert zu klären.
- Die bestehenden Demo-Zugänge patrick, mark, paul und jonas haben vorläufig die technische Admin-Rolle.
- Die Demo wird direkt auf Vercel mit extern verwaltetem PostgreSQL geplant. Eine Neon-Ressource im kostenlosen Tarif wurde mit dem Vercel-Projekt `project-dt-sap` und der lokalen Entwicklung verbunden; die Better-Auth-Migration wurde angewendet. Entwicklung und Demo nutzen eine einzige gemeinsame Datenbank; Schemaänderungen und Resets werden im Team abgestimmt.
- Echter E-Mail-Versand ist kein Bestandteil des MVP. Benachrichtigungen werden testbar simuliert und protokolliert beziehungsweise als In-App-Aufgaben angezeigt.
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
