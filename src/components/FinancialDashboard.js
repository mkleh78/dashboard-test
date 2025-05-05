import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Main dashboard component
const FinanzkompassDashboard = () => {
  // State for the dashboard
  const [formData, setFormData] = useState({
    // Personal Data (NEW)
    alter: 46,
    geschlecht: 'weiblich',
    alleinstehend: false,
    immobilie: true,
    auto: true,
    
    // Financial Basis
    einkommen: 2200,
    fixeKosten: 1050,
    variableKosten: 650,
    notgroschen: 5100,
    dispoKredite: 100,
    ratenKredite: 12000,
    
    // Risk Protection
    versicherungen: {
      krankenversicherung: true,
      berufsunfaehigkeit: false,
      privateHaftpflicht: true,
      risikoleben: false,
      unfall: true,
      hausrat: true,
      wohngebaeude: true,
      rechtsschutz: true,
      kfzHaftpflicht: true
    },
    
    // Emergency Folder
    notfallordner: {
      vorsorgevollmacht: true,
      patientenverfuegung: true,
      betreuungsverfuegung: false,
      bankUnterlagen: true,
      testament: false,
      kontaktliste: true
    },
    
    // Investment & Asset Base
    vermoegenAnlage: {
      aktienEtfs: false,
      aktienEtfsBetrag: 0,
      immobilien: true,
      immobilienBetrag: 25000,
      anleihen: false,
      anleihenBetrag: 0,
      versicherungen: true,
      versicherungenBetrag: 18000,
      bankeinlagen: true,
      bankeinlagenBetrag: 12000
    },
    
    // Retirement Planning
    altersvorsorge: {
      gesetzlicheRente: 850,
      betrieblicheRente: 150,
      privateRente: 100
    }
  });
  
  // Calculate all scores
  const [scores, setScores] = useState({
    sparquote: 0,
    notgroschen: 0,
    schulden: 0,
    finanzielleBasis: 0,
    personenversicherungen: 0,
    sachversicherungen: 0,
    notfallordner: 0,
    risikoabsicherung: 0,
    vermoegensanlage: 0,
    altersvorsorge: 0,
    anlageVermoegensbasis: 0,
    gesamtscore: 0
  });
  
  // Category-specific colors
  const CATEGORY_COLORS = {
    finanzielleBasis: '#0088FE', // Blue
    risikoabsicherung: '#00C49F', // Green
    vermoegenAnlage: '#FFBB28'  // Yellow
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    excellent: '#4CAF50',
    good: '#8BC34A',
    average: '#FFC107',
    poor: '#FF9800',
    critical: '#F44336'
  };
  
  // Calculate all scores when form data changes
  useEffect(() => {
    // Calculate scores based on formData
    const calculatedScores = calculateScores(formData);
    setScores(calculatedScores);
  }, [formData]);
  
  // Set document title and favicon
  useEffect(() => {
    document.title = "Financial Wellbeing Dashboard";
    
    // Create link element for favicon
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = 'Icon.png';
    document.head.appendChild(link);
  }, []);
  
  // Helper function to calculate all scores
  const calculateScores = (data) => {
    // Extract data
    const { einkommen, fixeKosten, variableKosten, notgroschen, dispoKredite, ratenKredite,
            versicherungen, notfallordner, vermoegenAnlage, altersvorsorge,
            // NEW: personal data 
            alter, alleinstehend, immobilie, auto } = data;
    
    // 1. Calculate Sparquote Score - UPDATED LOGIC
    const monatUeberschuss = einkommen - fixeKosten - variableKosten;
    const sparquote = monatUeberschuss / einkommen;
    // Now 20% savings rate or higher gives 100% score, scaling proportionally between 0-20%
    const sparquoteScore = Math.min(100, Math.max(0, (sparquote / 0.2) * 100));
    
    // 2. Calculate Notgroschen Score
    const monatsausgaben = fixeKosten + variableKosten;
    const notgroschenSoll = 3 * monatsausgaben;
    const notgroschenScore = Math.min(100, (notgroschen / notgroschenSoll) * 100);
    
    // 3. Calculate Schulden Score
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
    
    // Apply malus for Dispo > 500€
    if (dispoKredite > 500) {
      schuldenScore -= 5;
    }
    
    schuldenScore = Math.max(0, schuldenScore);
    
    // 4. Calculate Finanzielle Basis Score
    const finanzielleBasisScore = (
      0.4 * notgroschenScore +
      0.35 * schuldenScore +
      0.25 * sparquoteScore
    );
    
    // 5. Calculate Personenversicherungen Score
    // MODIFIED: Adapt scoring based on personal circumstances
    let personenversicherungenScore = 0;
    let maxPersonenversicherungenScore = 0;
    
    // Krankenversicherung is always needed
    maxPersonenversicherungenScore += 30;
    if (versicherungen.krankenversicherung) personenversicherungenScore += 30;
    
    // Berufsunfähigkeit is always needed
    maxPersonenversicherungenScore += 30;
    if (versicherungen.berufsunfaehigkeit) personenversicherungenScore += 30;
    
    // Private Haftpflicht is always needed
    maxPersonenversicherungenScore += 20;
    if (versicherungen.privateHaftpflicht) personenversicherungenScore += 20;
    
    // Risikoleben only needed if not single
    if (!alleinstehend) {
      maxPersonenversicherungenScore += 15;
      if (versicherungen.risikoleben) personenversicherungenScore += 15;
    }
    
    // Unfall is always needed
    maxPersonenversicherungenScore += 5;
    if (versicherungen.unfall) personenversicherungenScore += 5;
    
    // Normalize score to 100 scale if max score changed
    personenversicherungenScore = maxPersonenversicherungenScore > 0 ? 
      (personenversicherungenScore / maxPersonenversicherungenScore) * 100 : 0;
    
    // 6. Calculate Sachversicherungen Score
    // MODIFIED: Adapt scoring based on personal circumstances
    let sachversicherungenScore = 0;
    let maxSachversicherungenScore = 0;
    
    // Private Haftpflicht is always needed
    maxSachversicherungenScore += 35;
    if (versicherungen.privateHaftpflicht) sachversicherungenScore += 35;
    
    // Hausrat is always needed
    maxSachversicherungenScore += 20;
    if (versicherungen.hausrat) sachversicherungenScore += 20;
    
    // Wohngebäude only needed if property is owned
    if (immobilie) {
      maxSachversicherungenScore += 20;
      if (versicherungen.wohngebaeude) sachversicherungenScore += 20;
    }
    
    // Rechtsschutz is always needed
    maxSachversicherungenScore += 15;
    if (versicherungen.rechtsschutz) sachversicherungenScore += 15;
    
    // KFZ-Haftpflicht only needed if car is owned
    if (auto) {
      maxSachversicherungenScore += 10;
      if (versicherungen.kfzHaftpflicht) sachversicherungenScore += 10;
    }
    
    // Normalize score to 100 scale if max score changed
    sachversicherungenScore = maxSachversicherungenScore > 0 ? 
      (sachversicherungenScore / maxSachversicherungenScore) * 100 : 0;
    
    // 7. Calculate Notfallordner Score
    let notfallordnerScore = 0;
    if (notfallordner.vorsorgevollmacht) notfallordnerScore += 25;
    if (notfallordner.patientenverfuegung) notfallordnerScore += 20;
    if (notfallordner.betreuungsverfuegung) notfallordnerScore += 20;
    if (notfallordner.bankUnterlagen) notfallordnerScore += 20;
    if (notfallordner.testament) notfallordnerScore += 10;
    if (notfallordner.kontaktliste) notfallordnerScore += 5;
    
    // 8. Calculate Risikoabsicherung Score
    const risikoabsicherungScore = (
      0.5 * personenversicherungenScore +
      0.3 * sachversicherungenScore +
      0.2 * notfallordnerScore
    );
    
    // 9. Calculate Vermögensanlage Score - NEW SIMPLIFIED LOGIC
    /* 
     * New Investment Score Calculation:
     * 
     * The score is based on two key factors:
     * 1. Diversification (30% of total score)
     *    - Measures how well the portfolio is diversified across asset classes
     *    - Perfect score requires at least 4 asset classes with min 10% allocation each
     * 
     * 2. Coverage Adequacy (70% of total score)
     *    - Measures if the total investment covers 5 years of expenses
     *    - 100% score when investments = 5 years of monthly expenses
     */
    
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
    
    // Years to retirement (for documentation, not used in this calculation)
    const yearsToRetirement = 67 - alter;
    
    // 1. Calculate diversification score (30% of the total score)
    let diversificationScore = 0;
    if (percentages) {
      // Count asset classes with at least 10% allocation
      const diversifiedClasses = Object.keys(percentages).filter(assetClass => 
        percentages[assetClass] >= 0.1
      ).length;
      
      // Maximum score with 4 or more asset classes with at least 10% each
      diversificationScore = Math.min(100, diversifiedClasses * 25);
    } else {
      // If no investments yet
      diversificationScore = 0;
    }
    
    // 2. Calculate coverage score (70% of the total score)
    // Target: 5 years of expenses
    const monthlyExpenses = fixeKosten + variableKosten;
    const coverageTarget = monthlyExpenses * 12 * 5; // 5 years of expenses
    
    let coverageScore = 0;
    if (totalInvestment > 0) {
      coverageScore = Math.min(100, (totalInvestment / coverageTarget) * 100);
    }
    
    // Calculate final score with proper weighting
    const vermoegensanlageScore = (0.3 * diversificationScore) + (0.7 * coverageScore);
    
    // 10. Calculate Altersvorsorge Score - UPDATED WITH INFLATION
    // Consider retirement at age 67 and 2% annual inflation
    const inflationFactor = Math.pow(1.02, yearsToRetirement); // 2% inflation compounded yearly
    const altersvorsorgeAnsprueche = altersvorsorge.gesetzlicheRente + altersvorsorge.betrieblicheRente + altersvorsorge.privateRente;
    
    // Future expenses adjusted for inflation
    const futureMonthlyExpenses = (fixeKosten + variableKosten) * inflationFactor;
    
    // Calculate replacement ratio (pension income as % of expenses)
    const replacementRatio = altersvorsorgeAnsprueche / futureMonthlyExpenses;
    
    // Score based on 80% replacement ratio being ideal (100% score)
    const altersvorsorgeScore = Math.min(100, (replacementRatio / 0.8) * 100);
    
    // 11. Calculate Anlage & Vermögensbasis Score - UPDATED WEIGHTING
    const anlageVermoegensbasisScore = (
      0.5 * altersvorsorgeScore +  // Changed from 0.7 to 0.5
      0.5 * vermoegensanlageScore  // Changed from 0.3 to 0.5
    );
    
    // 12. Calculate Gesamtscore
    const gesamtScore = (finanzielleBasisScore + risikoabsicherungScore + anlageVermoegensbasisScore) / 3;
    
    return {
      sparquote: sparquoteScore,
      notgroschen: notgroschenScore,
      schulden: schuldenScore,
      finanzielleBasis: finanzielleBasisScore,
      personenversicherungen: personenversicherungenScore,
      sachversicherungen: sachversicherungenScore,
      notfallordner: notfallordnerScore,
      risikoabsicherung: risikoabsicherungScore,
      vermoegensanlage: vermoegensanlageScore,
      altersvorsorge: altersvorsorgeScore,
      anlageVermoegensbasis: anlageVermoegensbasisScore,
      gesamtscore: gesamtScore
    };
  };

  // Helper function to get status color based on score and category
  const getStatusColor = (score, category) => {
    // Use category-specific colors for pillar scores
    if (category === 'finanzielleBasis') return CATEGORY_COLORS.finanzielleBasis;
    if (category === 'risikoabsicherung') return CATEGORY_COLORS.risikoabsicherung;
    if (category === 'anlageVermoegensbasis') return CATEGORY_COLORS.vermoegenAnlage;
    
    // For sub-categories, determine their parent category and use that color
    if (['notgroschen', 'schulden', 'sparquote'].includes(category)) {
      return CATEGORY_COLORS.finanzielleBasis;
    }
    
    if (['personenversicherungen', 'sachversicherungen', 'notfallordner'].includes(category)) {
      return CATEGORY_COLORS.risikoabsicherung;
    }
    
    if (['vermoegensanlage', 'altersvorsorge'].includes(category)) {
      return CATEGORY_COLORS.vermoegenAnlage;
    }
    
    // For generic scores without category, use status-based coloring
    if (score >= 90) return STATUS_COLORS.excellent;
    if (score >= 75) return STATUS_COLORS.good;
    if (score >= 60) return STATUS_COLORS.average;
    if (score >= 40) return STATUS_COLORS.poor;
    return STATUS_COLORS.critical;
  };
  
  // Generate recommendations based on scores
  const getRecommendations = () => {
    const recommendations = [];
    
    // Financial Basis recommendations
    if (scores.notgroschen < 60) {
      recommendations.push({
        category: "Finanzielle Basis",
        title: "Notgroschen aufbauen",
        description: "Erhöhe deinen Notgroschen auf mindestens 3 Monatsausgaben, um finanzielle Engpässe zu überbrücken."
      });
    }
    
    if (scores.schulden < 70) {
      recommendations.push({
        category: "Finanzielle Basis",
        title: "Schulden reduzieren",
        description: "Konzentriere dich auf die Rückzahlung deiner Schulden, besonders teure Dispokredite."
      });
    }
    
    if (scores.sparquote < 50) {
      recommendations.push({
        category: "Finanzielle Basis",
        title: "Sparquote erhöhen",
        description: "Überprüfe deine variablen Ausgaben und versuche, deine monatliche Sparrate zu erhöhen."
      });
    }
    
    // Risk Protection recommendations
    if (scores.personenversicherungen < 70) {
      const missingInsurance = [];
      if (!formData.versicherungen.krankenversicherung) missingInsurance.push("Krankenversicherung");
      if (!formData.versicherungen.berufsunfaehigkeit) missingInsurance.push("Berufsunfähigkeitsversicherung");
      if (!formData.versicherungen.privateHaftpflicht) missingInsurance.push("Private Haftpflichtversicherung");
      if (!formData.alleinstehend && !formData.versicherungen.risikoleben) missingInsurance.push("Risikolebensversicherung");
      
      if (missingInsurance.length > 0) {
        recommendations.push({
          category: "Risikoabsicherung",
          title: "Personenversicherungen ergänzen",
          description: `Erwäge den Abschluss folgender wichtiger Versicherungen: ${missingInsurance.join(", ")}.`
        });
      }
    }
    
    if (scores.sachversicherungen < 60) {
      const missingInsurance = [];
      if (!formData.versicherungen.privateHaftpflicht) missingInsurance.push("Private Haftpflichtversicherung");
      if (!formData.versicherungen.hausrat) missingInsurance.push("Hausratversicherung");
      if (formData.immobilie && !formData.versicherungen.wohngebaeude) missingInsurance.push("Wohngebäudeversicherung");
      if (formData.auto && !formData.versicherungen.kfzHaftpflicht) missingInsurance.push("KFZ-Haftpflichtversicherung");
      
      if (missingInsurance.length > 0) {
        recommendations.push({
          category: "Risikoabsicherung",
          title: "Sachversicherungen ergänzen",
          description: `Prüfe den Abschluss folgender Versicherungen: ${missingInsurance.join(", ")}.`
        });
      }
    }
    
    if (scores.notfallordner < 50) {
      recommendations.push({
        category: "Risikoabsicherung",
        title: "Notfallordner vervollständigen",
        description: "Erstelle wichtige Dokumente wie Vorsorgevollmacht und Patientenverfügung für den Notfall."
      });
    }
    
    // Investment & Asset Base recommendations
    if (scores.vermoegensanlage < 60) {
      if (!formData.vermoegenAnlage.aktienEtfs) {
        recommendations.push({
          category: "Anlage & Vermögensbasis",
          title: "Diversifikation verbessern",
          description: "Erwäge Investments in Aktien oder ETFs, um deine Rendite zu steigern und besser zu diversifizieren."
        });
      } else if (!formData.vermoegenAnlage.immobilien && !formData.vermoegenAnlage.anleihen) {
        recommendations.push({
          category: "Anlage & Vermögensbasis",
          title: "Anlageklassen erweitern",
          description: "Ergänze dein Portfolio um weitere Anlageklassen wie Immobilien oder Anleihen."
        });
      }
    }
    
    if (scores.altersvorsorge < 70) {
      recommendations.push({
        category: "Anlage & Vermögensbasis",
        title: "Altersvorsorge ausbauen",
        description: "Erhöhe deine Altersvorsorge, um im Ruhestand deinen Lebensstandard zu sichern."
      });
    }
    
    return recommendations;
  };
  
  // Prepare data for charts
  const pillarData = [
    { name: 'Finanzielle Basis', value: scores.finanzielleBasis, color: getStatusColor(scores.finanzielleBasis, 'finanzielleBasis'), category: 'finanzielleBasis' },
    { name: 'Risikoabsicherung', value: scores.risikoabsicherung, color: getStatusColor(scores.risikoabsicherung, 'risikoabsicherung'), category: 'risikoabsicherung' },
    { name: 'Anlage & Vermögensbasis', value: scores.anlageVermoegensbasis, color: getStatusColor(scores.anlageVermoegensbasis, 'anlageVermoegensbasis'), category: 'anlageVermoegensbasis' }
  ];
  
  const detailData = [
    { name: 'Notgroschen', value: scores.notgroschen, color: getStatusColor(scores.notgroschen, 'notgroschen'), category: 'finanzielleBasis' },
    { name: 'Schulden', value: scores.schulden, color: getStatusColor(scores.schulden, 'schulden'), category: 'finanzielleBasis' },
    { name: 'Sparquote', value: scores.sparquote, color: getStatusColor(scores.sparquote, 'sparquote'), category: 'finanzielleBasis' },
    { name: 'Personenversicherungen', value: scores.personenversicherungen, color: getStatusColor(scores.personenversicherungen, 'personenversicherungen'), category: 'risikoabsicherung' },
    { name: 'Sachversicherungen', value: scores.sachversicherungen, color: getStatusColor(scores.sachversicherungen, 'sachversicherungen'), category: 'risikoabsicherung' },
    { name: 'Notfallordner', value: scores.notfallordner, color: getStatusColor(scores.notfallordner, 'notfallordner'), category: 'risikoabsicherung' },
    { name: 'Vermögensanlage', value: scores.vermoegensanlage, color: getStatusColor(scores.vermoegensanlage, 'vermoegensanlage'), category: 'anlageVermoegensbasis' },
    { name: 'Altersvorsorge', value: scores.altersvorsorge, color: getStatusColor(scores.altersvorsorge, 'altersvorsorge'), category: 'anlageVermoegensbasis' }
  ];
  
  // Generate recommendations
  const recommendations = getRecommendations();
  
  // Handle form input changes
  const handleInputChange = (e, section, subsection) => {
    const { name, value, type, checked } = e.target;
    
    // Convert value to number or use 0 if empty for number fields
    const numValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
    
    if (section) {
      if (subsection) {
        // Handle nested subsection (like versicherungen.krankenversicherung)
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [name]: type === 'checkbox' ? checked : numValue
            }
          }
        }));
      } else {
        // Handle section with direct property (like versicherungen.krankenversicherung)
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === 'checkbox' ? checked : numValue
          }
        }));
      }
    } else {
      // Handle top-level property
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : numValue
      }));
    }
    
    // Special handling: if unchecking an investment type, reset its amount to 0
    if (type === 'checkbox' && !checked && section === 'vermoegenAnlage') {
      if (name === 'aktienEtfs') {
        setFormData(prev => ({
          ...prev,
          vermoegenAnlage: {
            ...prev.vermoegenAnlage,
            aktienEtfsBetrag: 0
          }
        }));
      } else if (name === 'immobilien') {
        setFormData(prev => ({
          ...prev,
          vermoegenAnlage: {
            ...prev.vermoegenAnlage,
            immobilienBetrag: 0
          }
        }));
      } else if (name === 'anleihen') {
        setFormData(prev => ({
          ...prev,
          vermoegenAnlage: {
            ...prev.vermoegenAnlage,
            anleihenBetrag: 0
          }
        }));
      } else if (name === 'versicherungen') {
        setFormData(prev => ({
          ...prev,
          vermoegenAnlage: {
            ...prev.vermoegenAnlage,
            versicherungenBetrag: 0
          }
        }));
      } else if (name === 'bankeinlagen') {
        setFormData(prev => ({
          ...prev,
          vermoegenAnlage: {
            ...prev.vermoegenAnlage,
            bankeinlagenBetrag: 0
          }
        }));
      }
    }
    
    // NEW: Special handling for conditional fields based on personal data
    if (name === 'immobilie' && !checked) {
      // If property is unchecked, reset Wohngebäude insurance
      setFormData(prev => ({
        ...prev,
        versicherungen: {
          ...prev.versicherungen,
          wohngebaeude: false
        }
      }));
    }
    
    if (name === 'auto' && !checked) {
      // If car is unchecked, reset KFZ-Haftpflicht insurance
      setFormData(prev => ({
        ...prev,
        versicherungen: {
          ...prev.versicherungen,
          kfzHaftpflicht: false
        }
      }));
    }
    
    if (name === 'alleinstehend' && checked) {
      // If single is checked, reset Risikoleben insurance
      setFormData(prev => ({
        ...prev,
        versicherungen: {
          ...prev.versicherungen,
          risikoleben: false
        }
      }));
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-3 sm:p-6 min-h-screen">
      <header className="mb-6 sm:mb-8 relative">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Financial Wellbeing Dashboard
          </h1>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-emerald-400 mt-2"></div>
      </header>
      
      {/* Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 flex flex-col items-center justify-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Gesamtscore</h2>
          <div className="relative w-36 sm:w-48 h-36 sm:h-48 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getStatusColor(scores.gesamtscore)}
                strokeWidth="3"
                strokeDasharray={`${scores.gesamtscore}, 100`}
                strokeLinecap="round"
                className="transform -rotate-90 origin-center"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl sm:text-4xl font-bold">{Math.round(scores.gesamtscore)}%</span>
              <span className="text-xs sm:text-sm text-gray-400 mt-1">Gesamt</span>
            </div>
          </div>
        </div>
        
        {/* Pillar Scores */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 col-span-1 lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Scores Bedarfsfelder</h2>
          <div className="flex flex-col sm:flex-row items-center justify-around h-auto sm:h-48">
            {pillarData.map((entry, index) => (
              <div key={`pillar-${index}`} className="flex flex-col items-center mb-6 sm:mb-0 w-full sm:w-auto">
                <div className="relative w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={entry.color}
                      strokeWidth="3"
                      strokeDasharray={`${entry.value}, 100`}
                      strokeLinecap="round"
                      className="transform -rotate-90 origin-center"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold">{Math.round(entry.value)}%</span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm mt-2 text-center max-w-36" style={{ color: entry.color }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* NEW: Personal Data Form */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 mb-6 sm:mb-8">
        <h3 className="font-medium text-lg mb-4 text-purple-400">Persönliche Daten</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Alter</label>
            <input
              type="number"
              name="alter"
              value={formData.alter}
              onChange={(e) => handleInputChange(e)}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Geschlecht</label>
            <select
              name="geschlecht"
              value={formData.geschlecht}
              onChange={(e) => handleInputChange(e)}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="männlich">Männlich</option>
              <option value="weiblich">Weiblich</option>
              <option value="divers">Divers</option>
            </select>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="alleinstehend"
                checked={formData.alleinstehend}
                onChange={(e) => handleInputChange(e)}
                className="mr-2"
              />
              <label className="text-sm">Alleinstehend</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="immobilie"
                checked={formData.immobilie}
                onChange={(e) => handleInputChange(e)}
                className="mr-2"
              />
              <label className="text-sm">Immobilie vorhanden</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="auto"
                checked={formData.auto}
                onChange={(e) => handleInputChange(e)}
                className="mr-2"
              />
              <label className="text-sm">Auto vorhanden</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Entry Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Financial Basis Box */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700">
          <h3 className="font-medium text-lg mb-4" style={{ color: CATEGORY_COLORS.finanzielleBasis }}>Finanzielle Basis</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Einkommen (€/Monat)</label>
              <input
                type="number"
                name="einkommen"
                value={formData.einkommen}
                onChange={(e) => handleInputChange(e)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fixe Kosten (€/Monat)</label>
              <input
                type="number"
                name="fixeKosten"
                value={formData.fixeKosten}
                onChange={(e) => handleInputChange(e)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Variable Kosten (€/Monat)</label>
              <input
                type="number"
                name="variableKosten"
                value={formData.variableKosten}
                onChange={(e) => handleInputChange(e)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notgroschen (€)</label>
              <input
                type="number"
                name="notgroschen"
                value={formData.notgroschen}
                onChange={(e) => handleInputChange(e)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Dispo-Kredite (€)</label>
              <input
                type="number"
                name="dispoKredite"
                value={formData.dispoKredite}
                onChange={(e) => handleInputChange(e)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ratenkredite (€)</label>
              <input
                type="number"
                name="ratenKredite"
                value={formData.ratenKredite}
                onChange={(e) => handleInputChange(e)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Risk Protection Box */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700">
          <h3 className="font-medium text-lg mb-4" style={{ color: CATEGORY_COLORS.risikoabsicherung }}>Risikoabsicherung</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm" style={{ color: CATEGORY_COLORS.risikoabsicherung }}>Personenversicherungen</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="krankenversicherung"
                  checked={formData.versicherungen.krankenversicherung}
                  onChange={(e) => handleInputChange(e, 'versicherungen')}
                  className="mr-2"
                />
                <label className="text-sm">Krankenversicherung</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="berufsunfaehigkeit"
                  checked={formData.versicherungen.berufsunfaehigkeit}
                  onChange={(e) => handleInputChange(e, 'versicherungen')}
                  className="mr-2"
                />
                <label className="text-sm">Berufsunfähigkeit</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="privateHaftpflicht"
                  checked={formData.versicherungen.privateHaftpflicht}
                  onChange={(e) => handleInputChange(e, 'versicherungen')}
                  className="mr-2"
                />
                <label className="text-sm">Private Haftpflicht</label>
              </div>
              
              {/* Only show Risikoleben if not single */}
              {!formData.alleinstehend && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="risikoleben"
                    checked={formData.versicherungen.risikoleben}
                    onChange={(e) => handleInputChange(e, 'versicherungen')}
                    className="mr-2"
                  />
                  <label className="text-sm">Risikoleben</label>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="unfall"
                  checked={formData.versicherungen.unfall}
                  onChange={(e) => handleInputChange(e, 'versicherungen')}
                  className="mr-2"
                />
                <label className="text-sm">Unfallversicherung</label>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm" style={{ color: CATEGORY_COLORS.risikoabsicherung }}>Sachversicherungen</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hausrat"
                  checked={formData.versicherungen.hausrat}
                  onChange={(e) => handleInputChange(e, 'versicherungen')}
                  className="mr-2"
                />
                <label className="text-sm">Hausrat</label>
              </div>
              
              {/* Only show Wohngebäude if property is owned */}
              {formData.immobilie && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="wohngebaeude"
                    checked={formData.versicherungen.wohngebaeude}
                    onChange={(e) => handleInputChange(e, 'versicherungen')}
                    className="mr-2"
                  />
                  <label className="text-sm">Wohngebäude</label>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rechtsschutz"
                  checked={formData.versicherungen.rechtsschutz}
                  onChange={(e) => handleInputChange(e, 'versicherungen')}
                  className="mr-2"
                />
                <label className="text-sm">Rechtsschutz</label>
              </div>
              
              {/* Only show KFZ-Haftpflicht if car is owned */}
              {formData.auto && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="kfzHaftpflicht"
                    checked={formData.versicherungen.kfzHaftpflicht}
                    onChange={(e) => handleInputChange(e, 'versicherungen')}
                    className="mr-2"
                  />
                  <label className="text-sm">KFZ-Haftpflicht</label>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm" style={{ color: CATEGORY_COLORS.risikoabsicherung }}>Notfallordner</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="vorsorgevollmacht"
                  checked={formData.notfallordner.vorsorgevollmacht}
                  onChange={(e) => handleInputChange(e, 'notfallordner')}
                  className="mr-2"
                />
                <label className="text-sm">Vorsorgevollmacht</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="patientenverfuegung"
                  checked={formData.notfallordner.patientenverfuegung}
                  onChange={(e) => handleInputChange(e, 'notfallordner')}
                  className="mr-2"
                />
                <label className="text-sm">Patientenverfügung</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="betreuungsverfuegung"
                  checked={formData.notfallordner.betreuungsverfuegung}
                  onChange={(e) => handleInputChange(e, 'notfallordner')}
                  className="mr-2"
                />
                <label className="text-sm">Betreuungsverfügung</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="bankUnterlagen"
                  checked={formData.notfallordner.bankUnterlagen}
                  onChange={(e) => handleInputChange(e, 'notfallordner')}
                  className="mr-2"
                />
                <label className="text-sm">Bank- und Versicherungsunterlagen</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="testament"
                  checked={formData.notfallordner.testament}
                  onChange={(e) => handleInputChange(e, 'notfallordner')}
                  className="mr-2"
                />
                <label className="text-sm">Testament oder Erbvertrag</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="kontaktliste"
                  checked={formData.notfallordner.kontaktliste}
                  onChange={(e) => handleInputChange(e, 'notfallordner')}
                  className="mr-2"
                />
                <label className="text-sm">Kontaktliste für Notfälle</label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Investment & Asset Base Box */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700">
          <h3 className="font-medium text-lg mb-4" style={{ color: CATEGORY_COLORS.vermoegenAnlage }}>Anlage & Vermögensbasis</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm" style={{ color: CATEGORY_COLORS.vermoegenAnlage }}>Vermögensanlage</h4>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="aktienEtfs"
                    checked={formData.vermoegenAnlage.aktienEtfs}
                    onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                    className="mr-2"
                  />
                  <label className="text-sm">Aktien/ETFs</label>
                </div>
                {formData.vermoegenAnlage.aktienEtfs && (
                  <div className="ml-6">
                    <input
                      type="number"
                      name="aktienEtfsBetrag"
                      value={formData.vermoegenAnlage.aktienEtfsBetrag}
                      onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                      className="bg-gray-700 rounded px-3 py-1 text-white text-sm w-full md:w-3/4"
                      placeholder="Betrag in €"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="immobilien"
                    checked={formData.vermoegenAnlage.immobilien}
                    onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                    className="mr-2"
                  />
                  <label className="text-sm">Immobilien</label>
                </div>
                {formData.vermoegenAnlage.immobilien && (
                  <div className="ml-6">
                    <input
                      type="number"
                      name="immobilienBetrag"
                      value={formData.vermoegenAnlage.immobilienBetrag}
                      onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                      className="bg-gray-700 rounded px-3 py-1 text-white text-sm w-full md:w-3/4"
                      placeholder="Betrag in €"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="anleihen"
                    checked={formData.vermoegenAnlage.anleihen}
                    onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                    className="mr-2"
                  />
                  <label className="text-sm">Anleihen/Rentenfonds</label>
                </div>
                {formData.vermoegenAnlage.anleihen && (
                  <div className="ml-6">
                    <input
                      type="number"
                      name="anleihenBetrag"
                      value={formData.vermoegenAnlage.anleihenBetrag}
                      onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                      className="bg-gray-700 rounded px-3 py-1 text-white text-sm w-full md:w-3/4"
                      placeholder="Betrag in €"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="versicherungen"
                    checked={formData.vermoegenAnlage.versicherungen}
                    onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                    className="mr-2"
                  />
                  <label className="text-sm">Lebens-/Rentenversicherungen</label>
                </div>
                {formData.vermoegenAnlage.versicherungen && (
                  <div className="ml-6">
                    <input
                      type="number"
                      name="versicherungenBetrag"
                      value={formData.vermoegenAnlage.versicherungenBetrag}
                      onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                      className="bg-gray-700 rounded px-3 py-1 text-white text-sm w-full md:w-3/4"
                      placeholder="Betrag in €"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="bankeinlagen"
                    checked={formData.vermoegenAnlage.bankeinlagen}
                    onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                    className="mr-2"
                  />
                  <label className="text-sm">Bankeinlagen (Tagesgeld, etc.)</label>
                </div>
                {formData.vermoegenAnlage.bankeinlagen && (
                  <div className="ml-6">
                    <input
                      type="number"
                      name="bankeinlagenBetrag"
                      value={formData.vermoegenAnlage.bankeinlagenBetrag}
                      onChange={(e) => handleInputChange(e, 'vermoegenAnlage')}
                      className="bg-gray-700 rounded px-3 py-1 text-white text-sm w-full md:w-3/4"
                      placeholder="Betrag in €"
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm" style={{ color: CATEGORY_COLORS.vermoegenAnlage }}>Altersvorsorge (€/Monat)</h4>
              
              <div>
                <label className="block text-sm mb-1">Gesetzliche Rente</label>
                <input
                  type="number"
                  name="gesetzlicheRente"
                  value={formData.altersvorsorge.gesetzlicheRente}
                  onChange={(e) => handleInputChange(e, 'altersvorsorge')}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Betriebliche Rente</label>
                <input
                  type="number"
                  name="betrieblicheRente"
                  value={formData.altersvorsorge.betrieblicheRente}
                  onChange={(e) => handleInputChange(e, 'altersvorsorge')}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Private Rente</label>
                <input
                  type="number"
                  name="privateRente"
                  value={formData.altersvorsorge.privateRente}
                  onChange={(e) => handleInputChange(e, 'altersvorsorge')}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Details - UPDATED FOR MOBILE RESPONSIVENESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 col-span-1 lg:col-span-3">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Detailanalyse</h2>
          <div className="w-full overflow-x-auto">
            <div className="min-w-full" style={{ minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={detailData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#555" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#ccc' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const item = detailData.find(d => d.name === payload.value);
                      const textColor = item ? item.color : '#ccc';
                      return (
                        <text x={x} y={y} dy={4} textAnchor="end" fill={textColor} fontSize={12}>
                          {payload.value}
                        </text>
                      );
                    }}
                    width={120} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    formatter={(value) => [`${Math.round(value)}%`, 'Score']}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }} // ADDED: White text for scores
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {detailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="mt-6 sm:mt-8 bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-emerald-400 opacity-10 transform rotate-45 translate-x-16 -translate-y-8"></div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Empfehlungen</h2>
        <div className="space-y-4 pr-2">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div 
                key={`rec-${index}`} 
                className="p-3 sm:p-4 rounded-lg bg-gray-700 border-l-4"
                style={{ borderLeftColor: 
                  rec.category === "Finanzielle Basis" ? CATEGORY_COLORS.finanzielleBasis : 
                  rec.category === "Risikoabsicherung" ? CATEGORY_COLORS.risikoabsicherung : 
                  CATEGORY_COLORS.vermoegenAnlage 
                }}
              >
                <div className="text-xs sm:text-sm" style={{ 
                  color: rec.category === "Finanzielle Basis" ? CATEGORY_COLORS.finanzielleBasis : 
                         rec.category === "Risikoabsicherung" ? CATEGORY_COLORS.risikoabsicherung : 
                         CATEGORY_COLORS.vermoegenAnlage 
                }}>{rec.category}</div>
                <h3 className="font-medium mb-1 text-sm sm:text-base">{rec.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300">{rec.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-6">
              Super! Deine finanzielle Situation ist ausgezeichnet.
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm">
        <p>© 2025 Roland Berger & House of Finance & Tech Berlin // Feedback bitte an markus.lehleiter@hoft.berlin</p>
      </footer>
    </div>
  );
};

export default FinanzkompassDashboard;
