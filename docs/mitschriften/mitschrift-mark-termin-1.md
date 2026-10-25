# Zusammenfassung des Mark-Transkripts: SAP-Kick-off vom 23.10.2026

## Projektteam

- Am Projekt arbeiten Lisa und Max.
- Natascha wurde im Zusammenhang mit Data Quality genannt; der Nachname bzw. die genaue Rolle ist im Transkript nicht eindeutig verständlich.

## Ausgangslage

Wird ein Kunde aufgrund von Sanktionen oder Exportkontrollvorgaben gesperrt, löst dies abhängig von seinen Produkten und Verträgen unterschiedliche Maßnahmen aus. Bei Cloud-Kunden muss beispielsweise der Zugriff auf die jeweils genutzten Cloud-Lösungen gesperrt werden. Auch S-User, über die Kunden das SAP-Service-Portal nutzen, können betroffen sein.

SAP GTS ist das führende System für die Kundensperre. Die erforderlichen Folgeaktivitäten werden derzeit jedoch überwiegend manuell über E-Mails und getrennte Excel-Dateien in verschiedenen Abteilungen koordiniert. Die Dateien werden nur unregelmäßig abgeglichen; das führt zu Medienbrüchen, unklaren Zuständigkeiten und schlechter Datenqualität.

## Zielbild

Das Projekt soll ein zentrales Register bzw. Dashboard für gesperrte Kunden konzipieren und prototypisch umsetzen. Es soll für Export Control und beteiligte Fachbereiche eine gemeinsame, aktuelle Sicht auf Kundensperren und deren Bearbeitungsstand bieten.

Wesentliche Ziele sind:

- Transparenz darüber, welche Folgeaktivitäten ausgelöst, erledigt oder noch offen sind.
- Beschriebene und nachvollziehbare Kommunikations- und Workflowprozesse.
- Teilautomatisierung dort, wo dies sinnvoll ist; bei anderen Schritten bleibt ein Human in the Loop erforderlich.
- Benachrichtigung der zuständigen Teams sowie Rückmeldung über die erfolgte Bearbeitung.
- Einbindung der Account Executives, damit sie bei Rückfragen eines gesperrten Kunden auskunftsfähig sind.
- Eine spätere Schnittstelle zwischen SAP GTS und dem Register als Zielarchitektur.

## Fachliche Anforderungen an das Register

Für jeden gesperrten Kunden soll das Register mindestens folgende Informationen darstellen bzw. erfassen:

- Customer ID und Kundenname
- ETS-Kategorie bzw. Restriktionsgrad
- Referenz zur Sanktionsliste bzw. zum auslösenden Programm
- Kennzeichnung besonderer Kundentypen oder Kategorien
- Freitext-Kommentare zur Entscheidung bzw. zum Hintergrund
- Datum und Status der Sperre
- Zuständigkeiten und Bearbeitungsstatus der Folgeaktivitäten
- Audit Trail, etwa Zeitpunkt der Sperre und der fachlichen Freigabe

Verschiedene Berechtigungsstufen sind vorgesehen. Die Kategorien und ihre Bedeutung sollen noch durch eine SAP-Guidance bereitgestellt werden.

## Vorgesehener Workflow

1. Export Control identifiziert einen sanktionierten Kunden und prüft ihn in SAP GTS.
2. Die Kundensperre wird in SAP GTS vorgenommen bzw. bestätigt.
3. Das Register soll die Sperre und die nötigen Folgeaktivitäten sichtbar machen.
4. Zuständige Teams erhalten eine Benachrichtigung und bearbeiten ihre jeweilige Maßnahme.
5. Die Teams melden die Durchführung zurück; der Bearbeitungsstand bleibt im Register nachvollziehbar.
6. Bei kritischen Schritten ist eine zweite Prüfung durch Export Control vorgesehen.

## Abgrenzung des MVP

Die gemeinsame Umsetzung ist bewusst als Quick-and-Dirty-Prototyp gedacht. Sie soll die fachliche Idee, die Registeransicht und die Workflows sichtbar machen, aber zunächst nicht produktiv in die SAP-Systemlandschaft integriert sein.

- Keine echte Verbindung zu SAP GTS oder anderen SAP-Systemen im Prototyp.
- Daten werden mit Platzhaltern bzw. Mock-Daten gepflegt, statt sie automatisch aus SAP zu laden.
- Benachrichtigungen können als UI-Element oder simulierte E-Mail dargestellt werden; ein echter Versand ist nicht erforderlich.
- Die Lösung soll als Grundlage dienen, um Anforderungen und Integrationswünsche später mit den IT-Teams zu konkretisieren.
- Die konkrete Technologie ist für den Prototyp offen; entscheidend sind Konzept, Demonstrierbarkeit und ein SAP-nahes Erscheinungsbild.

## Rahmenbedingungen und offene Punkte

- Eine spätere produktive Integration benötigt Zugang zur SAP-Umgebung sowie Sicherheits- und Freigabekonzepte.
- Bei externen Systemen darf nicht nachvollziehbar sein, dass abgefragte Informationen von SAP stammen; als mögliches Beispiel wurde eine Adressprüfung genannt.
- Zu klären ist, ob Exportkontrollpflichten auch für registrierte Kunden ohne aktuelle Transaktion greifen.
- Die beteiligten Teams, Kontaktpersonen und Empfängergruppen für Benachrichtigungen müssen vollständig erfasst werden.
- Die genaue Bedeutung der ETS-Kategorien sowie die Ausgestaltung der Berechtigungen sind noch zu spezifizieren.

## Organisation

- Präsenztermin: alle zwei Wochen freitags.
- Dazwischen: wöchentlicher Online-Termin.
- Zum Abschluss ist eine Präsentation bei SAP mit anschließender Feedbackrunde vorgesehen.
