# Finanzkompass Dashboard

Ein interaktives Dashboard zur Bewertung der finanziellen Situation von Privatpersonen, entwickelt von Markus Lehleiter für das House of Finance & Tech und Roland Berger.

![Dashboard Screenshot](/api/placeholder/800/400)

## Übersicht

Das Finanzkompass Dashboard ist ein React-basiertes Tool, das Nutzern hilft, ihre finanzielle Situation zu analysieren und zu verbessern. Das Dashboard bewertet drei Hauptbereiche der persönlichen Finanzen:

1. **Finanzielle Basis** - Kurzfristige finanzielle Stabilität
2. **Risikoabsicherung** - Schutz vor unvorhergesehenen Ereignissen
3. **Anlage & Vermögensbasis** - Langfristiger Vermögensaufbau

Basierend auf den eingegebenen Daten berechnet das Dashboard Scores für jeden Bereich und gibt personalisierte Empfehlungen zur Verbesserung der finanziellen Situation.

## Funktionen

- **Interaktive Datenerfassung**: Einfache Eingabe von Einkommen, Ausgaben, Ersparnissen, Schulden, Versicherungen und Anlagen
- **Visualisierung**: Übersichtliche grafische Darstellung der finanziellen Situation
- **Detailanalyse**: Aufschlüsselung der Scores nach Teilbereichen
- **Personalisierte Empfehlungen**: Konkrete Handlungsvorschläge basierend auf den individuellen Schwachstellen
- **Responsive Design**: Optimiert für Desktop- und mobile Nutzung

## Technische Details

- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Visualisierungen**: Recharts
- **Berechnungslogik**: JavaScript

## Installation und Start

1. Repository klonen:
   ```
   git clone https://github.com/username/finanzkompass-dashboard.git
   cd finanzkompass-dashboard
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Entwicklungsserver starten:
   ```
   npm start
   ```

4. Im Browser öffnen:
   ```
   http://localhost:3000
   ```

## Projektstruktur

```
src/
├── assets/          # Logos und Bilder
├── components/      # React-Komponenten
│   ├── FinanzkompassDashboard.js
│   └── ... 
├── utils/           # Hilfsfunktionen und Berechnungen
├── App.js           # Hauptanwendung
└── index.js         # Entry point
```

## Berechnungslogik

Die Berechnungslogik des Dashboards ist in der separaten Datei [DOCUMENTATION.md](./DOCUMENTATION.md) detailliert beschrieben. Besonders hervorzuheben ist die verbesserte Methode zur Berechnung des Vermögensanlage-Scores, die auf modernen Portfoliotheorie-Prinzipien basiert und folgende Aspekte berücksichtigt:

- Tatsächliche Portfolioallokation
- Konzentrationsnachteil für übermäßige Konzentration in einzelnen Anlageklassen
- Diversifikationsbonus für breit gestreute Portfolios
- Angemessenheitsbonus für ausreichende Investitionshöhe

## Anpassung und Erweiterung

Das Dashboard kann leicht angepasst und erweitert werden:

- Änderung der Gewichtungen in der Berechnungslogik (siehe `calculateScores` Funktion)
- Hinzufügen neuer Bewertungskategorien
- Anpassung der Empfehlungslogik (siehe `getRecommendations` Funktion)
- Erweiterung um weitere Visualisierungen

## Lizenz

© 2025 House of Finance & Tech // entwickelt von Markus Lehleiter

## Kontakt

Bei Fragen oder Anregungen wenden Sie sich bitte an:

**Markus Lehleiter**  
Email: contact@markus-lehleiter.com  
Website: www.hoft.de
