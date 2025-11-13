import natural from 'natural';

/**
 * NLP Service for Advanced Symptom Analysis
 * Enhances rule-based triage with natural language understanding
 */
class NLPService {
  constructor() {
    // Initialize tokenizer
    this.tokenizer = new natural.WordTokenizer();
    
    // Initialize stemmer (reduces words to root form)
    this.stemmer = natural.PorterStemmer;
    
    // Initialize sentiment analyzer (for severity detection)
    this.sentimentAnalyzer = new natural.SentimentAnalyzer(
      'English',
      this.stemmer,
      'afinn'
    );
    
    // Medical synonym mappings
    this.synonyms = {
      breathing: ['breathe', 'respiration', 'respiratory', 'breath', 'inhale', 'exhale'],
      pain: ['ache', 'hurt', 'painful', 'hurting', 'sore', 'discomfort', 'agony'],
      chest: ['thorax', 'breastbone', 'sternum', 'ribs'],
      severe: ['extreme', 'intense', 'serious', 'critical', 'terrible', 'awful', 'worst'],
      difficulty: ['trouble', 'hard', 'struggling', 'unable', 'cant', "can't", 'cannot'],
      bleeding: ['blood', 'hemorrhage', 'hemorrhaging', 'bleeding out'],
      unconscious: ['passed out', 'fainted', 'blacked out', 'unresponsive', 'not responding'],
      dizzy: ['lightheaded', 'vertigo', 'spinning', 'woozy', 'faint'],
      nausea: ['nauseous', 'sick', 'queasy', 'upset stomach'],
      fever: ['temperature', 'hot', 'burning up', 'feverish', 'sweating'],
      headache: ['head pain', 'migraine', 'head hurts', 'head ache'],
      vomiting: ['throwing up', 'puking', 'vomit', 'sick to stomach'],
      weakness: ['weak', 'tired', 'fatigue', 'exhausted', 'no energy'],
      swelling: ['swollen', 'puffiness', 'inflammation', 'bloated'],
      cough: ['coughing', 'hacking', 'phlegm'],
    };
    
    // Negation patterns
    this.negationPatterns = [
      /\bno\s+(\w+)/gi,
      /\bnot\s+(\w+)/gi,
      /\bwithout\s+(\w+)/gi,
      /\bnever\s+(\w+)/gi,
      /\bdoes\s+not\s+(\w+)/gi,
      /\bdon't\s+(\w+)/gi,
      /\bdoesn't\s+(\w+)/gi,
      /\bhavent\s+(\w+)/gi,
      /\bhaven't\s+(\w+)/gi,
      /\bisn't\s+(\w+)/gi,
      /\baren't\s+(\w+)/gi,
    ];
    
    // Severity intensifiers
    this.intensifiers = {
      extreme: 2.0,
      severe: 1.8,
      very: 1.5,
      really: 1.4,
      extremely: 2.0,
      unbearable: 2.0,
      excruciating: 2.0,
      terrible: 1.7,
      awful: 1.6,
      bad: 1.3,
      worst: 2.0,
      intense: 1.6,
      sharp: 1.5,
      burning: 1.5,
      crushing: 1.8,
      sudden: 1.4,
    };
    
    // Severity reducers
    this.reducers = {
      mild: 0.5,
      slight: 0.6,
      little: 0.6,
      minor: 0.5,
      small: 0.6,
      bit: 0.7,
      somewhat: 0.7,
      moderately: 0.8,
      moderate: 0.8,
    };
    
    // Temporal markers (for symptom timeline)
    this.temporalMarkers = {
      sudden: 'acute',
      suddenly: 'acute',
      'all of a sudden': 'acute',
      hours: 'acute',
      minutes: 'acute',
      days: 'subacute',
      weeks: 'chronic',
      months: 'chronic',
      years: 'chronic',
      ongoing: 'chronic',
      persistent: 'chronic',
      constant: 'chronic',
    };
  }
  
  /**
   * Main NLP analysis function
   */
  analyze(symptomsText) {
    const normalized = symptomsText.toLowerCase().trim();
    
    return {
      tokens: this.extractTokens(normalized),
      entities: this.extractMedicalEntities(normalized),
      negations: this.detectNegations(normalized),
      severity: this.analyzeSeverity(normalized),
      temporal: this.extractTemporalInfo(normalized),
      expandedSymptoms: this.expandSynonyms(normalized),
      sentiment: this.analyzeSentiment(normalized),
    };
  }
  
  /**
   * Tokenize and clean the text
   */
  extractTokens(text) {
    const tokens = this.tokenizer.tokenize(text);
    return {
      raw: tokens,
      stemmed: tokens.map(token => this.stemmer.stem(token)),
      filtered: tokens.filter(token => token.length > 2), // Remove very short words
    };
  }
  
  /**
   * Extract medical entities (symptoms, body parts, conditions)
   */
  extractMedicalEntities(text) {
    const entities = {
      symptoms: [],
      bodyParts: [],
      conditions: [],
    };
    
    // Common medical terms patterns
    const symptomPatterns = [
      /\b(pain|ache|hurt|burning|tingling|numbness|swelling|bleeding|discharge)\b/gi,
      /\b(fever|chills|sweating|nausea|vomiting|diarrhea|constipation)\b/gi,
      /\b(cough|wheeze|sneeze|shortness of breath|difficulty breathing)\b/gi,
      /\b(headache|migraine|dizziness|vertigo|confusion|seizure)\b/gi,
      /\b(rash|itching|hives|bruising|discoloration)\b/gi,
    ];
    
    const bodyPartPatterns = [
      /\b(head|neck|chest|abdomen|stomach|back|arm|leg|hand|foot|throat|ear|eye|nose)\b/gi,
      /\b(heart|lung|kidney|liver|brain|spine|muscle|joint|bone|skin)\b/gi,
    ];
    
    symptomPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.symptoms.push(...matches.map(m => m.toLowerCase()));
      }
    });
    
    bodyPartPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.bodyParts.push(...matches.map(m => m.toLowerCase()));
      }
    });
    
    // Remove duplicates
    entities.symptoms = [...new Set(entities.symptoms)];
    entities.bodyParts = [...new Set(entities.bodyParts)];
    
    return entities;
  }
  
  /**
   * Detect negations to avoid false positives
   */
  detectNegations(text) {
    const negatedTerms = [];
    
    this.negationPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          negatedTerms.push(match[1].toLowerCase());
        }
      }
    });
    
    return {
      hasNegations: negatedTerms.length > 0,
      negatedTerms: [...new Set(negatedTerms)],
      shouldExclude: negatedTerms,
    };
  }
  
  /**
   * Analyze severity using intensifiers and reducers
   */
  analyzeSeverity(text) {
    const tokens = this.tokenizer.tokenize(text);
    let severityMultiplier = 1.0;
    const modifiers = [];
    
    tokens.forEach((token, index) => {
      const lowerToken = token.toLowerCase();
      
      // Check intensifiers
      if (this.intensifiers[lowerToken]) {
        severityMultiplier *= this.intensifiers[lowerToken];
        modifiers.push({ type: 'intensifier', word: lowerToken, multiplier: this.intensifiers[lowerToken] });
      }
      
      // Check reducers
      if (this.reducers[lowerToken]) {
        severityMultiplier *= this.reducers[lowerToken];
        modifiers.push({ type: 'reducer', word: lowerToken, multiplier: this.reducers[lowerToken] });
      }
    });
    
    return {
      multiplier: Math.max(0.1, Math.min(severityMultiplier, 3.0)), // Clamp between 0.1 and 3.0
      modifiers,
      level: this.categorizeSeverity(severityMultiplier),
    };
  }
  
  /**
   * Categorize severity level
   */
  categorizeSeverity(multiplier) {
    if (multiplier >= 1.8) return 'critical';
    if (multiplier >= 1.3) return 'high';
    if (multiplier >= 0.8) return 'medium';
    return 'low';
  }
  
  /**
   * Extract temporal information
   */
  extractTemporalInfo(text) {
    const temporal = {
      onset: null,
      duration: null,
      frequency: null,
    };
    
    // Check temporal markers
    for (const [marker, category] of Object.entries(this.temporalMarkers)) {
      if (text.includes(marker)) {
        temporal.onset = category;
        break;
      }
    }
    
    // Extract duration patterns
    const durationPattern = /(\d+)\s*(minute|hour|day|week|month|year)s?/gi;
    const durationMatch = text.match(durationPattern);
    if (durationMatch) {
      temporal.duration = durationMatch[0];
    }
    
    // Frequency patterns
    if (text.includes('constant') || text.includes('continuous')) {
      temporal.frequency = 'constant';
    } else if (text.includes('intermittent') || text.includes('comes and goes')) {
      temporal.frequency = 'intermittent';
    }
    
    return temporal;
  }
  
  /**
   * Expand symptoms with synonyms
   */
  expandSynonyms(text) {
    let expanded = text;
    const foundSynonyms = [];
    
    for (const [term, synonyms] of Object.entries(this.synonyms)) {
      // Check if any synonym is in the text
      for (const syn of synonyms) {
        const regex = new RegExp(`\\b${syn}\\b`, 'gi');
        if (regex.test(text)) {
          // Add the main term if not already present
          if (!expanded.includes(term)) {
            expanded += ` ${term}`;
            foundSynonyms.push({ found: syn, expanded: term });
          }
        }
      }
    }
    
    return {
      originalText: text,
      expandedText: expanded,
      addedTerms: foundSynonyms,
    };
  }
  
  /**
   * Sentiment analysis for emotional distress
   */
  analyzeSentiment(text) {
    const tokens = this.tokenizer.tokenize(text);
    const score = this.sentimentAnalyzer.getSentiment(tokens);
    
    // Negative sentiment in medical context often indicates distress
    return {
      score, // Range: -5 (very negative) to 5 (very positive)
      distressLevel: score < -2 ? 'high' : score < 0 ? 'medium' : 'low',
      interpretation: this.interpretSentiment(score),
    };
  }
  
  /**
   * Interpret sentiment score
   */
  interpretSentiment(score) {
    if (score < -3) return 'severe distress';
    if (score < -1) return 'moderate distress';
    if (score < 1) return 'neutral';
    return 'positive outlook';
  }
  
  /**
   * Enhanced symptom matching with NLP
   */
  enhancedMatch(symptomsText, keywords) {
    const nlpAnalysis = this.analyze(symptomsText);
    const matches = [];
    
    // Use expanded text for matching
    const textToMatch = nlpAnalysis.expandedSymptoms.expandedText.toLowerCase();
    
    // Check each keyword
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Check if keyword is in negated terms - if so, skip it
      const isNegated = nlpAnalysis.negations.negatedTerms.some(neg => 
        keywordLower.includes(neg) || neg.includes(keywordLower)
      );
      
      if (!isNegated && textToMatch.includes(keywordLower)) {
        matches.push({
          keyword,
          severityMultiplier: nlpAnalysis.severity.multiplier,
          confidence: this.calculateMatchConfidence(nlpAnalysis, keyword),
        });
      }
    });
    
    return {
      matches,
      nlpInsights: nlpAnalysis,
    };
  }
  
  /**
   * Calculate match confidence
   */
  calculateMatchConfidence(nlpAnalysis, keyword) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence if exact match in original text
    if (nlpAnalysis.expandedSymptoms.originalText.includes(keyword)) {
      confidence += 0.3;
    }
    
    // Increase confidence if medical entities detected
    if (nlpAnalysis.entities.symptoms.length > 0) {
      confidence += 0.1;
    }
    
    // Decrease confidence if many negations
    if (nlpAnalysis.negations.hasNegations) {
      confidence -= 0.1;
    }
    
    return Math.max(0.1, Math.min(confidence, 1.0));
  }
}

export const nlpService = new NLPService();
