Kick of Termin bei SAP (23.10.2026)

Fragen:
Wenn keine Transaktion stattfindet, ein Kunde aber im System registriert ist, gilt dann auch
die Exportkontrolle?

Notes:
• Einbindung externer Systeme ist möglich, solange nicht nachvollzogen werden kann, dass

     die Information auf SAP zurückzuführen ist. Möglich ist beispielsweise ist, dass abgefragt
     wird, ob eine Adresse existiert.

Story:
• Wenn ein Kunde blockiert werden soll werden verschiedene Prozesse in Kraft getreten

    --> Abhängig von Produkt werden unterschiedliche Prozesse aktiviert
         --> Der Kommunikationsprozess besteht aktuell hauptsächlich aus eMails und Excel

• Die Excel-Tabellen für Sanktionen werden parallel in den verschiedenen Abteilungen
     gepflegt und immer mal wieder abgeglichen --> händisch und schlechte Qualität

• Ziel sollte sein einige Prozess voll zu automatisieren und bei anderen die Kommunikation
     durch Human in the loop den Prozess transparent zu machen (--> klare
     Workflowbeschreibung)

• Kommunikationsflows sollten beschrieben und für die beteiligten klar sein, dass jeder
     Stakeholder weiß was zu tun ist

Ziel:
• Es soll ein Tool geben, dass verschiedene Berechtigungslevel hat
• API Connection zwischen GTS und dem Tool
• Das Tool soll eine vereinheitlichte Datenbank für die gesperrten Kundennummern sein
• In dem Tool soll gesammelt werden: Customer ID, ETS Category (Blockierkathegorien),

     sanction list referance (Woher kommt die Blockierung), SR or other specific category
     Customer (ist das ein besonderer Kunde), Comment (Erklärfeld), Blockierungsdatum,
     Verantwortlichkeit

• Es soll eine Quick and Dirty solution werden die nicht in das SAP System integriert ist
     aber die Kernidee darstellt --> Es soll mit Platzhaltern dargestellt sein, wie es aussehen
     könnte ein Integriertes System zu haben, das integriert in das SAP System ist

Orga:
• Alle zwei Wochen freitags vor Ort
• Sonst jede Woche online ein Termin
• Wir können bei der großen Präsentation am Ende auf SAP zurückkommen und sie um

     Feedback fragen
•
