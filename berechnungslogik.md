# Dokumentation zur Berechnungslogik des Finanzkompass-Dashboards

Diese Dokumentation beschreibt detailliert die Berechnungen, die im Finanzkompass-Dashboard für die Bewertung der finanziellen Situation eines Nutzers verwendet werden.

## Inhaltsverzeichnis

1. [Übersicht und Gesamtscore](#übersicht-und-gesamtscore)
2. [Säule 1: Finanzielle Basis](#säule-1-finanzielle-basis)
   - [Sparquote](#sparquote)
   - [Notgroschen](#notgroschen)
   - [Schulden](#schulden)
3. [Säule 2: Risikoabsicherung](#säule-2-risikoabsicherung)
   - [Personenversicherungen](#personenversicherungen)
   - [Sachversicherungen](#sachversicherungen)
   - [Notfallordner](#notfallordner)
4. [Säule 3: Anlage & Vermögensbasis](#säule-3-anlage--vermögensbasis)
   - [Vermögensanlage (verbesserte Methode)](#vermögensanlage-verbesserte-methode)
   - [Altersvorsorge](#altersvorsorge)
5. [Empfehlungslogik](#empfehlungslogik)

---

## Übersicht und Gesamtscore

Der Finanzkompass bewertet die finanzielle Gesamtsituation einer Person anhand von drei Hauptsäulen:

1. **Finanzielle Basis** (kurzfristige Stabilität)
2. **Risikoabsicherung** (Schutz vor unvorhergesehenen Ereignissen)
3. **Anlage & Vermögensbasis** (langfristiger Vermögensaufbau)

Der Gesamtscore wird als einfacher Durchschnitt der drei Säulen berechnet:

```
Gesamtscore = (Finanzielle Basis + Risikoabsicherung + Anlage & Vermögensbasis) / 3
```

Alle Scores werden auf einer Skala von 0% bis 100% angegeben, wobei höhere Werte eine bessere finanzielle Situation darstellen.

---

## Säule 1: Finanzielle Basis

Die finanzielle Basis wird aus drei Komponenten berechnet:

```
Finanzielle Basis = 0.4 * Notgroschen-Score + 0.35 * Schulden-Score + 0.25 * Sparquoten-Score
```

### Sparquote

Die Sparquote beschreibt, welcher Anteil des monatlichen Einkommens gespart wird.

**Berechnung:**
```
Monatlicher Überschuss = Einkommen - Fixe Kosten - Variable Kosten
Sparquote = Monatlicher Überschuss / Einkommen
Sparquoten-Score = min(100%, max(0%, Sparquote * 100))
```

Der Sparquoten-Score wird auf maximal 100% begrenzt und kann nicht negativ sein.

### Notgroschen

Der Notgroschen dient als finanzielle Reserve für unvorhergesehene Ausgaben oder Einkommensausfälle.

**Berechnung:**
```
Monatsausgaben = Fixe Kosten + Variable Kosten
Empfohlener Notgroschen = 3 * Monatsausgaben
Notgroschen-Score = min(100%, (Vorhandener Notgroschen / Empfohlener Notgroschen) * 100)
```

Ein Notgroschen in Höhe von mindestens drei Monatsausgaben wird mit 100% bewertet.

### Schulden

Der Schulden-Score bewertet die Höhe der Verschuldung im Verhältnis zum Jahreseinkommen.

**Berechnung:**
```
Gesamtschulden = Dispo-Kredite + Ratenkredite
Schuldenquote = Gesamtschulden / (Einkommen * 12)

Wenn Schuldenquote < 20%:
    Schulden-Score = 100%
Wenn Schuldenquote zwischen 20% und 35%:
    Schulden-Score = 100% - ((Schuldenquote - 20%) / 15%) * 50%
Wenn Schuldenquote > 35%:
    Schulden-Score = 50% - ((Schuldenquote - 35%) / 65%) * 50%
```

**Malus:**
Wenn Dispo-Kredite > 500€, werden 5 Prozentpunkte vom Score abgezogen.

Der minimale Schulden-Score beträgt 0%.

---

## Säule 2: Risikoabsicherung

Die Risikoabsicherung wird aus drei Komponenten berechnet:

```
Risikoabsicherung = 0.5 * Personenversicherungen-Score + 0.3 * Sachversicherungen-Score + 0.2 * Notfallordner-Score
```

### Personenversicherungen

Der Score für Personenversicherungen addiert die Gewichtungen der vorhandenen Versicherungen:

| Versicherung | Gewichtung |
|--------------|------------|
| Krankenversicherung | 30% |
| Berufsunfähigkeitsversicherung | 30% |
| Private Haftpflichtversicherung | 20% |
| Risikolebensversicherung | 15% |
| Unfallversicherung | 5% |

Die Summe der Gewichtungen ergibt den Personenversicherungen-Score (maximal 100%).

### Sachversicherungen

Der Score für Sachversicherungen addiert die Gewichtungen der vorhandenen Versicherungen:

| Versicherung | Gewichtung |
|--------------|------------|
| Privathaftpflichtversicherung | 35% |
| Hausratversicherung | 20% |
| Wohngebäudeversicherung | 20% |
| Rechtsschutzversicherung | 15% |
| Kfz-Versicherung (Haftpflicht) | 10% |

Die Summe der Gewichtungen ergibt den Sachversicherungen-Score (maximal 100%).

### Notfallordner

Der Notfallordner-Score addiert die Gewichtungen der vorhandenen Elemente:

| Element | Gewichtung |
|---------|------------|
| Vorsorgevollmacht | 25% |
| Patientenverfügung | 20% |
| Betreuungsverfügung | 20% |
| Bank- und Versicherungsunterlagen | 20% |
| Testament oder Erbvertrag | 10% |
| Kontaktliste für Notfälle | 5% |

Die Summe der Gewichtungen ergibt den Notfallordner-Score (maximal 100%).

---

## Säule 3: Anlage & Vermögensbasis

Die Anlage & Vermögensbasis wird aus zwei Komponenten berechnet:

```
Anlage & Vermögensbasis = 0.7 * Altersvorsorge-Score + 0.3 * Vermögensanlage-Score
```

### Vermögensanlage (verbesserte Methode)

Die verbesserte Methode zur Berechnung des Vermögensanlage-Scores berücksichtigt nicht nur die Anwesenheit verschiedener Anlageklassen, sondern auch deren Gewichtung im Portfolio, die Portfoliodiversifikation und die Angemessenheit des Gesamtinvestitionsbetrags.

**Schritt 1: Basiswerte der Anlageklassen**

| Anlageklasse | Basiswert (basierend auf Rendite- und Diversifikationspotenzial) |
|--------------|------------------------------------------------------------------|
| Aktien und ETFs | 60% |
| Immobilien | 40% |
| Anleihen und Rentenfonds | 25% |
| Lebens- und Rentenversicherungen | 15% |
| Bankeinlagen | 15% |

**Schritt 2: Gewichteter Score basierend auf tatsächlichen Anteilen**

```
Gewichteter Score = Summe(Basiswert jeder Anlageklasse * tatsächlicher Anteil im Portfolio)
```

Wenn keine Investitionen getätigt wurden, aber Anlageklassen ausgewählt sind, wird ein reduzierter Basiswert von 10% des vollen Werts pro ausgewählter Klasse angerechnet.

**Schritt 3: Konzentrationsnachteil**

Wenn mehr als 70% des Portfolios in einer einzelnen Anlageklasse konzentriert sind:

```
Konzentrationsnachteil = Summe((Anteil der Anlageklasse - 70%) * 30%) für jede Anlageklasse mit Anteil > 70%
```

**Schritt 4: Diversifikationsbonus**

```
Diversifikationsbonus = Min(Anzahl der Anlageklassen mit mindestens 10% Anteil * 5%, 20%)
```

Wenn keine Investitionen getätigt wurden, aber Anlageklassen ausgewählt sind:

```
Diversifikationsbonus = Min(Anzahl der ausgewählten Anlageklassen * 3%, 15%)
```

**Schritt 5: Angemessenheitsbonus**

```
Ziel-Investitionsbetrag = 12 * Monatsausgaben
Angemessenheitsbonus = Min((Gesamtinvestition / Ziel-Investitionsbetrag) * 15%, 15%)
```

**Schritt 6: Endgültiger Score**

```
Roher Score = Gewichteter Score - Konzentrationsnachteil + Diversifikationsbonus + Angemessenheitsbonus
Vermögensanlage-Score = Min(Max(Roher Score, 0%), 100%)
```

Diese verbesserte Methode belohnt:
- Ein diversifiziertes Portfolio
- Anlageklassen mit höherem Rendite- und Diversifikationspotenzial
- Ausreichend hohe Investitionsbeträge im Verhältnis zu den monatlichen Ausgaben

Und bestraft:
- Übermäßige Konzentration in einer einzelnen Anlageklasse

### Altersvorsorge

Der Altersvorsorge-Score bewertet die Höhe der monatlichen Rentenzahlungen im Verhältnis zu den monatlichen Ausgaben.

**Berechnung:**
```
Bisher erworbene Ansprüche = Gesetzliche Rente + Betriebliche Rente + Private Rente
Altersvorsorge-Score = min(100%, (Bisher erworbene Ansprüche / (Fixe Kosten + Variable Kosten)) * 100)
```

Ein Altersvorsorge-Score von 100% bedeutet, dass die erwarteten Rentenzahlungen mindestens die aktuellen monatlichen Ausgaben decken.

---

## Empfehlungslogik

Das Dashboard generiert automatisch Empfehlungen basierend auf den berechneten Scores. Die Empfehlungen konzentrieren sich auf Bereiche mit niedrigen Scores und geben konkrete Handlungsvorschläge zur Verbesserung der finanziellen Situation.

### Regeln für Empfehlungen:

1. **Finanzielle Basis:**
   - Notgroschen < 60%: Empfehlung zum Aufbau des Notgroschens
   - Schulden < 70%: Empfehlung zur Reduzierung von Schulden
   - Sparquote < 50%: Empfehlung zur Erhöhung der Sparquote

2. **Risikoabsicherung:**
   - Personenversicherungen < 70%: Empfehlung zum Abschluss fehlender wichtiger Versicherungen
   - Sachversicherungen < 60%: Empfehlung zum Abschluss fehlender wichtiger Sachversicherungen
   - Notfallordner < 50%: Empfehlung zur Vervollständigung des Notfallordners

3. **Anlage & Vermögensbasis:**
   - Vermögensanlage < 60%: Empfehlungen zur Verbesserung der Diversifikation oder zum Einstieg in Aktien/ETFs
   - Altersvorsorge < 70%: Empfehlung zum Ausbau der Altersvorsorge

---

Diese Dokumentation bietet einen umfassenden Überblick über die Berechnungslogik des Finanzkompass-Dashboards. Die verbesserte Methode zur Berechnung des Vermögensanlage-Scores berücksichtigt moderne Portfoliotheorie-Prinzipien und liefert ein differenzierteres Bild der Anlagesituation als die ursprüngliche Methode.
