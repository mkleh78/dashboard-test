# Financial Wellbeing Dashboard - Dokumentation der Berechnungslogik

Dieses Dokument erläutert die Berechnungslogik, die im Financial Wellbeing Dashboard verwendet wird. Das Dashboard bewertet die finanzielle Gesundheit in drei Hauptbereichen und liefert eine umfassende Bewertung mit spezifischen Empfehlungen.

## Überblick

Das Dashboard berechnet Scores in drei Hauptkategorien:
1. Finanzielle Basis (`finanzielleBasis`)
2. Risikoabsicherung (`risikoabsicherung`)
3. Anlage & Vermögensbasis (`anlageVermoegensbasis`)

Jede Kategorie enthält Unterkategorien, die gewichtet werden, um den Gesamtscore zu ermitteln.

## Berechnungsdetails

### 1. Finanzielle Basis Score

Der Score für die finanzielle Basis setzt sich aus drei Teilwerten zusammen:

#### 1.1 Sparquote Score (`sparquote`)
```javascript
const monatUeberschuss = einkommen - fixeKosten - variableKosten;
const sparquote = monatUeberschuss / einkommen;
const sparquoteScore = Math.min(1, Math.max(0, sparquote)) * 100;
```
- Berechnet den monatlichen Überschuss (Einkommen minus Ausgaben)
- Bestimmt die Sparquote als Prozentsatz des Einkommens
- Normalisiert auf eine 0-100 Skala (maximaler Wert 100%)

#### 1.2 Notgroschen Score (`notgroschen`)
```javascript
const monatsausgaben = fixeKosten + variableKosten;
const notgroschenSoll = 3 * monatsausgaben;
const notgroschenScore = Math.min(100, (notgroschen / notgroschenSoll) * 100);
```
- Ziel-Notgroschen entspricht 3x monatlichen Ausgaben
- Score entspricht dem Prozentsatz des erreichten Ziels
- Maximaler Wert 100%

#### 1.3 Schulden Score (`schulden`)
```javascript
const gesamtschulden = dispoKredite + ratenKredite;
const schuldenquote = gesamtschulden / (einkommen * 12);

let schuldenScore;
if (schuldenquote < 0.2) {
  schuldenScore = 100;
} else if (schuldenquote <= 0.35) {
  schuldenScore = 100 - ((schuldenquote - 0.2) / 0.15) * 50;
} else {
  schuldenScore = 50 - ((schuldenquote - 0.35) / 0.65) * 50;
}

// Abzug für Dispo > 500€
if (dispoKredite > 500) {
  schuldenScore -= 5;
}

schuldenScore = Math.max(0, schuldenScore);
```
- Berechnet das Verhältnis von Schulden zu Jahreseinkommen
- Score-Grenzwerte:
  * Schuldenquote < 20%: 100 Punkte
  * Schuldenquote 20-35%: Lineare Abnahme von 100 auf 50
  * Schuldenquote > 35%: Lineare Abnahme von 50 auf 0
- 5 Punkte Abzug für Dispokredit über 500€
- Mindestscore ist 0

#### 1.4 Gesamtscore Finanzielle Basis
```javascript
const finanzielleBasisScore = (
  0.4 * notgroschenScore +
  0.35 * schuldenScore +
  0.25 * sparquoteScore
);
```
Gewichteter Durchschnitt mit:
- Notgroschen: 40%
- Schulden: 35%
- Sparquote: 25%

### 2. Risikoabsicherung Score

Der Score für die Risikoabsicherung umfasst drei Teilwerte:

#### 2.1 Personenversicherungen Score (`personenversicherungen`)
```javascript
let personenversicherungenScore = 0;
let maxPersonenversicherungenScore = 0;

// Punkte für jede Versicherungsart
maxPersonenversicherungenScore += 30;
if (versicherungen.krankenversicherung) personenversicherungenScore += 30;

maxPersonenversicherungenScore += 30;
if (versicherungen.berufsunfaehigkeit) personenversicherungenScore += 30;

maxPersonenversicherungenScore += 20;
if (versicherungen.privateHaftpflicht) personenversicherungenScore += 20;

// Risikolebensversicherung nur wenn nicht alleinstehend
if (!alleinstehend) {
  maxPersonenversicherungenScore += 15;
  if (versicherungen.risikoleben) personenversicherungenScore += 15;
}

maxPersonenversicherungenScore += 5;
if (versicherungen.unfall) personenversicherungenScore += 5;

// Normalisierung auf 100-Punkte-Skala
personenversicherungenScore = maxPersonenversicherungenScore > 0 ? 
  (personenversicherungenScore / maxPersonenversicherungenScore) * 100 : 0;
```
- Punktevergabe nach Versicherungsart:
  * Krankenversicherung: 30 Punkte
  * Berufsunfähigkeitsversicherung: 30 Punkte
  * Private Haftpflicht: 20 Punkte
  * Risikolebensversicherung: 15 Punkte (nur wenn nicht alleinstehend)
  * Unfallversicherung: 5 Punkte
- Score wird auf Basis der anwendbaren Versicherungen normalisiert

#### 2.2 Sachversicherungen Score (`sachversicherungen`)
```javascript
let sachversicherungenScore = 0;
let maxSachversicherungenScore = 0;

// Punkte für jede Versicherungsart
maxSachversicherungenScore += 35;
if (versicherungen.privateHaftpflicht) sachversicherungenScore += 35;

maxSachversicherungenScore += 20;
if (versicherungen.hausrat) sachversicherungenScore += 20;

// Wohngebäudeversicherung nur bei Immobilienbesitz
if (immobilie) {
  maxSachversicherungenScore += 20;
  if (versicherungen.wohngebaeude) sachversicherungenScore += 20;
}

maxSachversicherungenScore += 15;
if (versicherungen.rechtsschutz) sachversicherungenScore += 15;

// KFZ-Versicherung nur bei Autobesitz
if (auto) {
  maxSachversicherungenScore += 10;
  if (versicherungen.kfzHaftpflicht) sachversicherungenScore += 10;
}

// Normalisierung auf 100-Punkte-Skala
sachversicherungenScore = maxSachversicherungenScore > 0 ? 
  (sachversicherungenScore / maxSachversicherungenScore) * 100 : 0;
```
- Punktevergabe nach Versicherungsart:
  * Private Haftpflicht: 35 Punkte
  * Hausratversicherung: 20 Punkte
  * Wohngebäudeversicherung: 20 Punkte (nur bei Immobilienbesitz)
  * Rechtsschutzversicherung: 15 Punkte
  * KFZ-Haftpflicht: 10 Punkte (nur bei Autobesitz)
- Score wird auf Basis der anwendbaren Versicherungen normalisiert

#### 2.3 Notfallordner Score (`notfallordner`)
```javascript
let notfallordnerScore = 0;
if (notfallordner.vorsorgevollmacht) notfallordnerScore += 25;
if (notfallordner.patientenverfuegung) notfallordnerScore += 20;
if (notfallordner.betreuungsverfuegung) notfallordnerScore += 20;
if (notfallordner.bankUnterlagen) notfallordnerScore += 20;
if (notfallordner.testament) notfallordnerScore += 10;
if (notfallordner.kontaktliste) notfallordnerScore += 5;
```
- Punktevergabe für verschiedene Dokumente:
  * Vorsorgevollmacht: 25 Punkte
  * Patientenverfügung: 20 Punkte
  * Betreuungsverfügung: 20 Punkte
  * Bank- und Versicherungsunterlagen: 20 Punkte
  * Testament oder Erbvertrag: 10 Punkte
  * Notfall-Kontaktliste: 5 Punkte
- Maximale Punktzahl: 100 Punkte

#### 2.4 Gesamtscore Risikoabsicherung
```javascript
const risikoabsicherungScore = (
  0.5 * personenversicherungenScore +
  0.3 * sachversicherungenScore +
  0.2 * notfallordnerScore
);
```
Gewichteter Durchschnitt mit:
- Personenversicherungen: 50%
- Sachversicherungen: 30%
- Notfallordner: 20%

### 3. Anlage & Vermögensbasis Score

Der Score für Anlage & Vermögensbasis besteht aus zwei Teilwerten:

#### 3.1 Vermögensanlage Score (`vermoegensanlage`)
Diese Berechnung umfasst mehrere Komponenten:

```javascript
// Berechnung des Gesamtinvestments
const totalInvestment = 
  (vermoegenAnlage.aktienEtfs ? vermoegenAnlage.aktienEtfsBetrag || 0 : 0) +
  (vermoegenAnlage.immobilien ? vermoegenAnlage.immobilienBetrag || 0 : 0) +
  (vermoegenAnlage.anleihen ? vermoegenAnlage.anleihenBetrag || 0 : 0) +
  (vermoegenAnlage.versicherungen ? vermoegenAnlage.versicherungenBetrag || 0 : 0) +
  (vermoegenAnlage.bankeinlagen ? vermoegenAnlage.bankeinlagenBetrag || 0 : 0);

// Berechnung der Prozentsätze für jede Anlageklasse
const percentages = totalInvestment === 0 ? null : {
  aktienEtfs: (vermoegenAnlage.aktienEtfs ? vermoegenAnlage.aktienEtfsBetrag || 0 : 0) / totalInvestment,
  immobilien: (vermoegenAnlage.immobilien ? vermoegenAnlage.immobilienBetrag || 0 : 0) / totalInvestment,
  anleihen: (vermoegenAnlage.anleihen ? vermoegenAnlage.anleihenBetrag || 0 : 0) / totalInvestment,
  versicherungen: (vermoegenAnlage.versicherungen ? vermoegenAnlage.versicherungenBetrag || 0 : 0) / totalInvestment,
  bankeinlagen: (vermoegenAnlage.bankeinlagen ? vermoegenAnlage.bankeinlagenBetrag || 0 : 0) / totalInvestment
};
```

1. **Basiswert-Berechnung**:
```javascript
// Basiswerte für jede Anlageklasse
const baseScores = {
  aktienEtfs: 60,
  immobilien: 40,
  anleihen: 25,
  versicherungen: 15,
  bankeinlagen: 15
};

// Berechnung des gewichteten Scores basierend auf tatsächlichen Prozentsätzen
let weightedScore = 0;
if (percentages) {
  Object.keys(percentages).forEach(assetClass => {
    if (percentages[assetClass] > 0) {
      weightedScore += baseScores[assetClass] * percentages[assetClass];
    }
  });
} else {
  // Wenn keine Investitionen, Prüfung welche Typen ausgewählt sind
  if (vermoegenAnlage.aktienEtfs) weightedScore += baseScores.aktienEtfs * 0.1;
  if (vermoegenAnlage.immobilien) weightedScore += baseScores.immobilien * 0.1;
  if (vermoegenAnlage.anleihen) weightedScore += baseScores.anleihen * 0.1;
  if (vermoegenAnlage.versicherungen) weightedScore += baseScores.versicherungen * 0.1;
  if (vermoegenAnlage.bankeinlagen) weightedScore += baseScores.bankeinlagen * 0.1;
}
```
- Basiswerte nach Anlageklasse:
  * Aktien/ETFs: 60 Punkte
  * Immobilien: 40 Punkte
  * Anleihen: 25 Punkte
  * Versicherungsanlagen: 15 Punkte
  * Bankeinlagen: 15 Punkte
- Gewichtet nach prozentualer Aufteilung
- Bei noch nicht getätigten Investitionen: 10% des Basiswerts für ausgewählte Typen

2. **Konzentrationsabzug**:
```javascript
// Berechnung des Konzentrationsabzugs
let concentrationPenalty = 0;
if (percentages) {
  Object.keys(percentages).forEach(assetClass => {
    if (percentages[assetClass] > 0.7) {
      concentrationPenalty += (percentages[assetClass] - 0.7) * 30;
    }
  });
}
```
- Bestraft Portfolios mit >70% in einer einzelnen Anlageklasse
- Bis zu 9% Abzug bei 100% Konzentration

3. **Diversifikationsbonus**:
```javascript
// Berechnung des Diversifikationsbonus
let diversificationBonus = 0;
if (percentages) {
  const diversifiedClasses = Object.keys(percentages).filter(assetClass => 
    percentages[assetClass] >= 0.1
  ).length;
  
  diversificationBonus = Math.min(diversifiedClasses * 5, 20);
} else {
  // Zählung der ausgewählten Anlageklassen, wenn noch keine Investitionen
  let selectedCount = 0;
  if (vermoegenAnlage.aktienEtfs) selectedCount++;
  if (vermoegenAnlage.immobilien) selectedCount++;
  if (vermoegenAnlage.anleihen) selectedCount++;
  if (vermoegenAnlage.versicherungen) selectedCount++;
  if (vermoegenAnlage.bankeinlagen) selectedCount++;
  
  diversificationBonus = Math.min(selectedCount * 3, 15);
}
```
- Fügt 5 Punkte für jede Anlageklasse mit mindestens 10% Anteil hinzu
- Maximaler Bonus: 20 Punkte (für alle 5 Anlageklassen)
- Für ausgewählte, aber noch nicht finanzierte Anlagen: 3 Punkte pro Auswahl, max. 15 Punkte

4. **Angemessenheitsbonus**:
```javascript
// Angemessenheit der Investitionen relativ zu den Ausgaben
const monthlyExpenses = fixeKosten + variableKosten;
const investmentTarget = monthlyExpenses * 12; // 1 Jahr Ausgaben
let adequacyBonus = 0;

if (totalInvestment > 0) {
  adequacyBonus = Math.min(totalInvestment / investmentTarget * 15, 15);
}
```
- Ziel: 12 Monate der Gesamtausgaben
- Bis zu 15 Punkte Bonus basierend auf dem Prozentsatz des erreichten Ziels

5. **Finaler Vermögensanlage Score**:
```javascript
// Berechnung des finalen Scores mit allen Komponenten
const rawScore = weightedScore - concentrationPenalty + diversificationBonus + adequacyBonus;

// Normalisierung auf 0-100 Skala
const vermoegensanlageScore = Math.min(Math.max(rawScore, 0), 100);
```
- Kombiniert alle Komponenten
- Stellt sicher, dass der finale Score zwischen 0-100 liegt

#### 3.2 Altersvorsorge Score (`altersvorsorge`)
```javascript
const altersvorsorgeAnsprueche = altersvorsorge.gesetzlicheRente + altersvorsorge.betrieblicheRente + altersvorsorge.privateRente;
const altersvorsorgeScore = Math.min(100, (altersvorsorgeAnsprueche / (fixeKosten + variableKosten)) * 100);
```
- Summiert das erwartete monatliche Renteneinkommen aus allen Quellen
- Score entspricht dem Prozentsatz der aktuellen monatlichen Ausgaben, die gedeckt sind
- Maximaler Wert 100%

#### 3.3 Gesamtscore Anlage & Vermögensbasis
```javascript
const anlageVermoegensbasisScore = (
  0.7 * altersvorsorgeScore +
  0.3 * vermoegensanlageScore
);
```
Gewichteter Durchschnitt mit:
- Altersvorsorge: 70%
- Vermögensanlage: 30%

### 4. Gesamtscore

```javascript
const gesamtScore = (finanzielleBasisScore + risikoabsicherungScore + anlageVermoegensbasisScore) / 3;
```
- Einfacher Durchschnitt der drei Hauptsäulen-Scores

## Empfehlungsmaschine

Das Dashboard generiert maßgeschneiderte Empfehlungen basierend auf identifizierten Schwächen:

```javascript
const getRecommendations = () => {
  const recommendations = [];
  
  // Empfehlungen zur finanziellen Basis
  if (scores.notgroschen < 60) {
    recommendations.push({
      category: "Finanzielle Basis",
      title: "Notgroschen aufbauen",
      description: "Erhöhe deinen Notgroschen auf mindestens 3 Monatsausgaben..."
    });
  }
  
  // Weitere Empfehlungslogik...
}
```

Empfehlungen werden ausgelöst, wenn bestimmte Teilwerte unter Schwellenwerte fallen und umfassen:
- Konkrete Handlungsempfehlung
- Beschreibung, warum die Maßnahme wichtig ist
- Kategorisierung nach finanzieller Säule

## Kontextbezogene Bewertungslogik

Das Dashboard passt die Bewertung an persönliche Umstände an:
- Versicherungsanforderungen unterscheiden sich je nach Familienstand, Immobilienbesitz und Fahrzeugbesitz
- Fehlende Versicherungen, die für die Situation des Nutzers nicht relevant sind, wirken sich nicht negativ auf die Bewertung aus
- Anlagestrategien werden auf Basis von Diversifikation, Konzentration und Angemessenheit bewertet

## Farbkodierung des Status

Das Dashboard verwendet ein Farbkodierungssystem, um den Score-Status visuell darzustellen:
- Ausgezeichnet (≥90%): Grün
- Gut (≥75%): Hellgrün
- Durchschnittlich (≥60%): Gelb
- Mangelhaft (≥40%): Orange
- Kritisch (<40%): Rot

Hauptkategorie-Scores verwenden ebenfalls ein einheitliches Farbschema zur visuellen Identifikation:
- Finanzielle Basis: Blau
- Risikoabsicherung: Grün
- Anlage & Vermögensbasis: Gelb
