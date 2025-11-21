// Medical keyword database for triage analysis
const MEDICAL_KEYWORDS = {
  critical: [
    // Cardiac emergencies
    "chest pain",
    "heart attack",
    "cardiac arrest",
    "chest pressure",
    "crushing chest pain",
    "heart racing",
    "palpitations severe",

    // Respiratory emergencies
    "can't breathe",
    "difficulty breathing",
    "shortness of breath severe",
    "choking",
    "gasping",
    "blue lips",
    "blue face",

    // Neurological emergencies
    "stroke",
    "seizure",
    "unconscious",
    "unresponsive",
    "paralysis",
    "severe headache",
    "confusion severe",
    "slurred speech",

    // Trauma/bleeding
    "severe bleeding",
    "heavy bleeding",
    "blood loss",
    "deep cut",
    "head injury",
    "broken bone",
    "compound fracture",

    // Other critical - removing generic "severe pain"
    "overdose",
    "poisoning",
    "anaphylaxis",
    "severe allergic reaction",
    "hypothermia",
  ],

  urgent: [
    // Moderate cardiac
    "chest discomfort",
    "heart palpitations",
    "irregular heartbeat",

    // Moderate respiratory
    "breathing difficulty",
    "wheezing",
    "cough with blood",
    "shortness of breath",
    "asthma attack",

    // Pain/discomfort
    "severe abdominal pain",
    "kidney pain",
    "back pain severe",
    "migraine",
    "intense headache",

    // Infections
    "fever with rash",
    "infection severe",
    "pneumonia symptoms",
    "flu severe",

    // Other urgent
    "dehydration severe",
    "vomiting blood",
    "diarrhea severe",
    "allergic reaction",
    "difficulty swallowing",
  ],

  moderate: [
    // General symptoms
    "fever",
    "headache",
    "nausea",
    "vomiting",
    "diarrhea",
    "abdominal pain",
    "back pain",
    "joint pain",
    "muscle pain",
    "body aches",

    // Respiratory - only significant cough types
    "persistent cough",
    "severe cough",
    "productive cough",
    "congestion",
    "sore throat",

    // Other moderate
    "rash",
    "swelling",
    "bruising",
    "minor cut",
    "sprain",
    "fatigue",
    "dizziness",
    "minor burn",
    "ear pain",
  ],

  mild: [
    // Minor issues
    "tired",
    "sleepy",
    "minor headache",
    "slight fever",
    "runny nose",
    "cough",
    "minor cough",
    "slight cough",
    "minor ache",
    "small cut",
    "minor bruise",
    "slight pain",
  ],
};

class KeywordMatcher {
  analyze(symptomsText) {
    const results = {
      critical: [],
      urgent: [],
      moderate: [],
      mild: [],
      matchedKeywords: [],
      totalMatches: 0,
    };

    // Create a set to track already matched keywords to avoid duplicates
    const matchedSet = new Set();

    // Check each category - order matters for specificity
    for (const [severity, keywords] of Object.entries(MEDICAL_KEYWORDS)) {
      // Sort keywords by length (longer first) to match more specific terms first
      const sortedKeywords = keywords.sort((a, b) => b.length - a.length);

      for (const keyword of sortedKeywords) {
        if (symptomsText.includes(keyword) && !matchedSet.has(keyword)) {
          results[severity].push(keyword);
          results.matchedKeywords.push({ keyword, severity });
          results.totalMatches++;
          matchedSet.add(keyword);
        }
      }
    }

    return results;
  }

  /**
   * NLP-enhanced analysis
   * Uses NLP insights to improve keyword matching
   */
  analyzeWithNLP(symptomsText, nlpAnalysis) {
    const results = {
      critical: [],
      urgent: [],
      moderate: [],
      mild: [],
      matchedKeywords: [],
      totalMatches: 0,
    };

    // Use expanded symptoms text from NLP
    const textToMatch = nlpAnalysis.expandedSymptoms.expandedText;
    const matchedSet = new Set();

    // Get list of negated terms to exclude
    const negatedTerms = nlpAnalysis.negations.negatedTerms;

    // Check each category
    for (const [severity, keywords] of Object.entries(MEDICAL_KEYWORDS)) {
      const sortedKeywords = keywords.sort((a, b) => b.length - a.length);

      for (const keyword of sortedKeywords) {
        // Check if keyword is negated
        const isNegated = negatedTerms.some(neg => 
          keyword.toLowerCase().includes(neg) || neg.includes(keyword.toLowerCase())
        );

        // Only match if not negated and not already matched
        if (!isNegated && textToMatch.includes(keyword) && !matchedSet.has(keyword)) {
          // Apply severity multiplier from NLP
          let adjustedSeverity = severity;
          
          // If NLP detected high severity modifiers, potentially upgrade severity
          if (nlpAnalysis.severity.multiplier >= 1.8 && severity === 'moderate') {
            adjustedSeverity = 'urgent';
          } else if (nlpAnalysis.severity.multiplier >= 2.0 && severity === 'urgent') {
            adjustedSeverity = 'critical';
          }
          
          // If NLP detected reducers, potentially downgrade severity
          if (nlpAnalysis.severity.multiplier <= 0.6 && severity === 'urgent') {
            adjustedSeverity = 'moderate';
          } else if (nlpAnalysis.severity.multiplier <= 0.5 && severity === 'critical') {
            adjustedSeverity = 'urgent';
          }

          results[adjustedSeverity].push(keyword);
          results.matchedKeywords.push({ 
            keyword, 
            severity: adjustedSeverity,
            originalSeverity: severity,
            nlpAdjusted: adjustedSeverity !== severity,
          });
          results.totalMatches++;
          matchedSet.add(keyword);
        }
      }
    }

    return results;
  }

  // Future enhancement: NLP integration point
  async analyzeWithAdvancedNLP(symptomsText) {
    // This is where you'd integrate advanced NLP models
    // For now, fallback to basic keyword matching
    throw new Error("Advanced NLP analysis not implemented yet");
  }
}

export const keywordMatcher = new KeywordMatcher();
