# Financial Wellbeing Dashboard - Calculation Logic Documentation

This document explains the calculation logic used in the Financial Wellbeing Dashboard application. The dashboard evaluates financial health across three main pillars and provides a comprehensive score with specific recommendations.

## Overview

The dashboard calculates scores in three main categories:
1. Financial Basis (`finanzielleBasis`)
2. Risk Protection (`risikoabsicherung`)
3. Investment & Asset Base (`anlageVermoegensbasis`)

Each category contains subcategories that are weighted to produce the overall score.

## Calculation Details

### 1. Financial Basis Score

The Financial Basis score is composed of three subscores:

#### 1.1 Savings Rate Score (`sparquote`)
```javascript
const monatUeberschuss = einkommen - fixeKosten - variableKosten;
const sparquote = monatUeberschuss / einkommen;
const sparquoteScore = Math.min(1, Math.max(0, sparquote)) * 100;
```
- Calculates monthly surplus (income minus expenses)
- Determines savings rate as percentage of income
- Normalizes to 0-100 scale (capped at 100%)

#### 1.2 Emergency Fund Score (`notgroschen`)
```javascript
const monatsausgaben = fixeKosten + variableKosten;
const notgroschenSoll = 3 * monatsausgaben;
const notgroschenScore = Math.min(100, (notgroschen / notgroschenSoll) * 100);
```
- Target emergency fund is 3x monthly expenses
- Score represents percentage of target achieved
- Capped at 100%

#### 1.3 Debt Score (`schulden`)
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

// Apply penalty for overdraft > €500
if (dispoKredite > 500) {
  schuldenScore -= 5;
}

schuldenScore = Math.max(0, schuldenScore);
```
- Calculates debt-to-annual-income ratio
- Score breakpoints:
  * Debt ratio < 20%: 100 points
  * Debt ratio 20-35%: Linear decrease from 100 to 50
  * Debt ratio > 35%: Linear decrease from 50 to 0
- 5-point penalty for overdrafts exceeding €500
- Minimum score is 0

#### 1.4 Overall Financial Basis Score
```javascript
const finanzielleBasisScore = (
  0.4 * notgroschenScore +
  0.35 * schuldenScore +
  0.25 * sparquoteScore
);
```
Weighted average with:
- Emergency fund: 40%
- Debt score: 35%
- Savings rate: 25%

### 2. Risk Protection Score

The Risk Protection score comprises three subscores:

#### 2.1 Personal Insurance Score (`personenversicherungen`)
```javascript
let personenversicherungenScore = 0;
let maxPersonenversicherungenScore = 0;

// Add points for each insurance type
maxPersonenversicherungenScore += 30;
if (versicherungen.krankenversicherung) personenversicherungenScore += 30;

maxPersonenversicherungenScore += 30;
if (versicherungen.berufsunfaehigkeit) personenversicherungenScore += 30;

maxPersonenversicherungenScore += 20;
if (versicherungen.privateHaftpflicht) personenversicherungenScore += 20;

// Life insurance only needed if not single
if (!alleinstehend) {
  maxPersonenversicherungenScore += 15;
  if (versicherungen.risikoleben) personenversicherungenScore += 15;
}

maxPersonenversicherungenScore += 5;
if (versicherungen.unfall) personenversicherungenScore += 5;

// Normalize to 100-point scale
personenversicherungenScore = maxPersonenversicherungenScore > 0 ? 
  (personenversicherungenScore / maxPersonenversicherungenScore) * 100 : 0;
```
- Points allocated by insurance type:
  * Health insurance: 30 points
  * Disability insurance: 30 points
  * Personal liability: 20 points
  * Life insurance: 15 points (only if not single)
  * Accident insurance: 5 points
- Score normalized based on applicable insurances

#### 2.2 Property Insurance Score (`sachversicherungen`)
```javascript
let sachversicherungenScore = 0;
let maxSachversicherungenScore = 0;

// Add points for each insurance type
maxSachversicherungenScore += 35;
if (versicherungen.privateHaftpflicht) sachversicherungenScore += 35;

maxSachversicherungenScore += 20;
if (versicherungen.hausrat) sachversicherungenScore += 20;

// Building insurance only if property owned
if (immobilie) {
  maxSachversicherungenScore += 20;
  if (versicherungen.wohngebaeude) sachversicherungenScore += 20;
}

maxSachversicherungenScore += 15;
if (versicherungen.rechtsschutz) sachversicherungenScore += 15;

// Car insurance only if car owned
if (auto) {
  maxSachversicherungenScore += 10;
  if (versicherungen.kfzHaftpflicht) sachversicherungenScore += 10;
}

// Normalize to 100-point scale
sachversicherungenScore = maxSachversicherungenScore > 0 ? 
  (sachversicherungenScore / maxSachversicherungenScore) * 100 : 0;
```
- Points allocated by insurance type:
  * Personal liability: 35 points
  * Home contents: 20 points
  * Building insurance: 20 points (only if property owned)
  * Legal protection: 15 points
  * Car liability: 10 points (only if car owned)
- Score normalized based on applicable insurances

#### 2.3 Emergency Documents Score (`notfallordner`)
```javascript
let notfallordnerScore = 0;
if (notfallordner.vorsorgevollmacht) notfallordnerScore += 25;
if (notfallordner.patientenverfuegung) notfallordnerScore += 20;
if (notfallordner.betreuungsverfuegung) notfallordnerScore += 20;
if (notfallordner.bankUnterlagen) notfallordnerScore += 20;
if (notfallordner.testament) notfallordnerScore += 10;
if (notfallordner.kontaktliste) notfallordnerScore += 5;
```
- Points allocated for different documents:
  * Power of attorney: 25 points
  * Living will: 20 points
  * Care directive: 20 points
  * Banking documents: 20 points
  * Will or inheritance contract: 10 points
  * Emergency contact list: 5 points
- Maximum possible score: 100 points

#### 2.4 Overall Risk Protection Score
```javascript
const risikoabsicherungScore = (
  0.5 * personenversicherungenScore +
  0.3 * sachversicherungenScore +
  0.2 * notfallordnerScore
);
```
Weighted average with:
- Personal insurance: 50%
- Property insurance: 30%
- Emergency documents: 20%

### 3. Investment & Asset Base Score

The Investment & Asset Base score consists of two subscores:

#### 3.1 Asset Investment Score (`vermoegensanlage`)
This calculation involves multiple components:

```javascript
// Calculate total investment
const totalInvestment = 
  (vermoegenAnlage.aktienEtfs ? vermoegenAnlage.aktienEtfsBetrag || 0 : 0) +
  (vermoegenAnlage.immobilien ? vermoegenAnlage.immobilienBetrag || 0 : 0) +
  (vermoegenAnlage.anleihen ? vermoegenAnlage.anleihenBetrag || 0 : 0) +
  (vermoegenAnlage.versicherungen ? vermoegenAnlage.versicherungenBetrag || 0 : 0) +
  (vermoegenAnlage.bankeinlagen ? vermoegenAnlage.bankeinlagenBetrag || 0 : 0);

// Calculate percentages for each asset class
const percentages = totalInvestment === 0 ? null : {
  aktienEtfs: (vermoegenAnlage.aktienEtfs ? vermoegenAnlage.aktienEtfsBetrag || 0 : 0) / totalInvestment,
  immobilien: (vermoegenAnlage.immobilien ? vermoegenAnlage.immobilienBetrag || 0 : 0) / totalInvestment,
  anleihen: (vermoegenAnlage.anleihen ? vermoegenAnlage.anleihenBetrag || 0 : 0) / totalInvestment,
  versicherungen: (vermoegenAnlage.versicherungen ? vermoegenAnlage.versicherungenBetrag || 0 : 0) / totalInvestment,
  bankeinlagen: (vermoegenAnlage.bankeinlagen ? vermoegenAnlage.bankeinlagenBetrag || 0 : 0) / totalInvestment
};
```

1. **Base Score Calculation**:
```javascript
// Base scores for each asset class
const baseScores = {
  aktienEtfs: 60,
  immobilien: 40,
  anleihen: 25,
  versicherungen: 15,
  bankeinlagen: 15
};

// Calculate weighted score based on actual percentages
let weightedScore = 0;
if (percentages) {
  Object.keys(percentages).forEach(assetClass => {
    if (percentages[assetClass] > 0) {
      weightedScore += baseScores[assetClass] * percentages[assetClass];
    }
  });
} else {
  // If no investments, check which types are selected
  if (vermoegenAnlage.aktienEtfs) weightedScore += baseScores.aktienEtfs * 0.1;
  if (vermoegenAnlage.immobilien) weightedScore += baseScores.immobilien * 0.1;
  if (vermoegenAnlage.anleihen) weightedScore += baseScores.anleihen * 0.1;
  if (vermoegenAnlage.versicherungen) weightedScore += baseScores.versicherungen * 0.1;
  if (vermoegenAnlage.bankeinlagen) weightedScore += baseScores.bankeinlagen * 0.1;
}
```
- Base score values by asset class:
  * Stocks/ETFs: 60 points
  * Real estate: 40 points
  * Bonds: 25 points
  * Insurance investments: 15 points
  * Bank deposits: 15 points
- Weighted by percentage allocation
- If no investments yet, applies 10% of base score for selected types

2. **Concentration Penalty**:
```javascript
// Calculate concentration penalty
let concentrationPenalty = 0;
if (percentages) {
  Object.keys(percentages).forEach(assetClass => {
    if (percentages[assetClass] > 0.7) {
      concentrationPenalty += (percentages[assetClass] - 0.7) * 30;
    }
  });
}
```
- Penalizes portfolios with >70% in a single asset class
- Up to 9% penalty for 100% concentration

3. **Diversification Bonus**:
```javascript
// Calculate diversification bonus
let diversificationBonus = 0;
if (percentages) {
  const diversifiedClasses = Object.keys(percentages).filter(assetClass => 
    percentages[assetClass] >= 0.1
  ).length;
  
  diversificationBonus = Math.min(diversifiedClasses * 5, 20);
} else {
  // Count selected asset classes if no investments yet
  let selectedCount = 0;
  if (vermoegenAnlage.aktienEtfs) selectedCount++;
  if (vermoegenAnlage.immobilien) selectedCount++;
  if (vermoegenAnlage.anleihen) selectedCount++;
  if (vermoegenAnlage.versicherungen) selectedCount++;
  if (vermoegenAnlage.bankeinlagen) selectedCount++;
  
  diversificationBonus = Math.min(selectedCount * 3, 15);
}
```
- Adds 5 points for each asset class with at least 10% allocation
- Maximum bonus: 20 points (for all 5 asset classes)
- For selected but unfunded investments: 3 points per selection, max 15 points

4. **Adequacy Bonus**:
```javascript
// Investment adequacy relative to expenses
const monthlyExpenses = fixeKosten + variableKosten;
const investmentTarget = monthlyExpenses * 12; // 1 year of expenses
let adequacyBonus = 0;

if (totalInvestment > 0) {
  adequacyBonus = Math.min(totalInvestment / investmentTarget * 15, 15);
}
```
- Target: 12 months of total expenses
- Up to 15 points bonus based on percentage of target achieved

5. **Final Investment Score**:
```javascript
// Calculate final score with all components
const rawScore = weightedScore - concentrationPenalty + diversificationBonus + adequacyBonus;

// Normalize to 0-100 scale
const vermoegensanlageScore = Math.min(Math.max(rawScore, 0), 100);
```
- Combines all components
- Ensures final score is between 0-100

#### 3.2 Retirement Planning Score (`altersvorsorge`)
```javascript
const altersvorsorgeAnsprueche = altersvorsorge.gesetzlicheRente + altersvorsorge.betrieblicheRente + altersvorsorge.privateRente;
const altersvorsorgeScore = Math.min(100, (altersvorsorgeAnsprueche / (fixeKosten + variableKosten)) * 100);
```
- Sums expected monthly retirement income from all sources
- Score represents percentage of current monthly expenses covered
- Capped at 100%

#### 3.3 Overall Investment & Asset Base Score
```javascript
const anlageVermoegensbasisScore = (
  0.7 * altersvorsorgeScore +
  0.3 * vermoegensanlageScore
);
```
Weighted average with:
- Retirement planning: 70%
- Asset investments: 30%

### 4. Overall Score (Gesamtscore)

```javascript
const gesamtScore = (finanzielleBasisScore + risikoabsicherungScore + anlageVermoegensbasisScore) / 3;
```
- Simple average of the three main pillar scores

## Recommendation Engine

The dashboard generates tailored recommendations based on identified weaknesses:

```javascript
const getRecommendations = () => {
  const recommendations = [];
  
  // Financial Basis recommendations
  if (scores.notgroschen < 60) {
    recommendations.push({
      category: "Finanzielle Basis",
      title: "Notgroschen aufbauen",
      description: "Erhöhe deinen Notgroschen auf mindestens 3 Monatsausgaben..."
    });
  }
  
  // Additional recommendation logic...
}
```

Recommendations are triggered when specific subscores fall below thresholds and include:
- Specific action to take
- Description of why the action is important
- Categorization by financial pillar

## Contextual Scoring Logic

The dashboard adapts scoring based on personal circumstances:
- Insurance requirements differ based on marital status, property ownership, and vehicle ownership
- Missing insurances that don't apply to the user's situation don't negatively impact their score
- Investment strategies are evaluated based on diversification, concentration, and adequacy

## Status Color Coding

The dashboard uses a color-coding system to visually represent score status:
- Excellent (≥90%): Green
- Good (≥75%): Light green
- Average (≥60%): Yellow
- Poor (≥40%): Orange
- Critical (<40%): Red

Main category scores also use a consistent color scheme for visual identification:
- Financial Basis: Blue
- Risk Protection: Green
- Investment & Asset Base: Yellow
