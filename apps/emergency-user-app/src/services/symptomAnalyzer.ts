import axios from 'axios';

export interface TriageResult {
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  detectedSymptoms: Array<{ keyword: string; severity: string }>;
  recommendations: string[];
  emergencyType: EmergencyType;
  nlpInsights?: {
    entities: {
      symptoms: string[];
      bodyParts: string[];
    };
    severity: {
      multiplier: number;
      level: string;
    };
    temporal: {
      onset: string | null;
      duration: string | null;
    };
    sentiment: {
      distressLevel: string;
      interpretation: string;
    };
  };
}

export type EmergencyType = 
  | 'cardiac'
  | 'respiratory'
  | 'trauma'
  | 'neurological'
  | 'bleeding'
  | 'poisoning'
  | 'allergic'
  | 'burn'
  | 'fracture'
  | 'general';

export interface SymptomInput {
  description: string;
  quickSymptoms?: string[];
  urgency?: 'immediate' | 'urgent' | 'moderate';
  patientInfo?: {
    age?: number;
    gender?: string;
    medicalHistory?: string[];
  };
}

class SymptomAnalyzer {
  private aiServiceUrl: string;

  constructor() {
    // Get dynamic IP from config
    const debuggerHost = require('expo-constants').default?.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      this.aiServiceUrl = `http://${ip}:8000`;
      console.log('🤖 AI Service URL (Auto-detected):', this.aiServiceUrl);
    } else {
      // Fallback for different platforms
      this.aiServiceUrl = 'http://localhost:8000';
      console.log('🤖 AI Service URL (Fallback):', this.aiServiceUrl);
    }
  }

  /**
   * Analyze symptoms using NLP-powered AI triage
   */
  async analyzeSymptoms(input: SymptomInput): Promise<TriageResult> {
    try {
      // Combine description with quick symptoms
      let fullDescription = input.description;
      
      if (input.quickSymptoms && input.quickSymptoms.length > 0) {
        fullDescription = `${input.quickSymptoms.join(', ')}. ${fullDescription}`;
      }

      console.log('🔍 Analyzing symptoms:', fullDescription);

      // Call NLP triage service
      const response = await axios.post(
        `${this.aiServiceUrl}/api/triage/analyze`,
        {
          symptoms: fullDescription,
          patientInfo: input.patientInfo || {},
        },
        {
          timeout: 5000, // 5 second timeout
        }
      );

      const analysis = response.data.analysis;

      // Determine emergency type from detected symptoms and NLP insights
      const emergencyType = this.determineEmergencyType(
        analysis.detectedSymptoms,
        analysis.nlpInsights
      );

      const result: TriageResult = {
        severity: analysis.severity,
        confidence: analysis.confidence,
        detectedSymptoms: analysis.detectedSymptoms,
        recommendations: analysis.recommendations,
        emergencyType,
        nlpInsights: analysis.nlpInsights,
      };

      console.log('✅ Analysis complete:', result);
      return result;

    } catch (error) {
      console.error('❌ Symptom analysis failed:', error);
      
      // Fallback to safe default
      return this.getFallbackAnalysis(input);
    }
  }

  /**
   * Determine emergency type from symptoms
   */
  private determineEmergencyType(
    symptoms: Array<{ keyword: string; severity: string }>,
    nlpInsights?: any
  ): EmergencyType {
    const symptomText = symptoms.map(s => s.keyword).join(' ').toLowerCase();
    const bodyParts = nlpInsights?.entities?.bodyParts || [];
    const detectedSymptoms = nlpInsights?.entities?.symptoms || [];

    // Cardiac emergencies
    if (
      symptomText.includes('chest pain') ||
      symptomText.includes('heart attack') ||
      symptomText.includes('cardiac') ||
      symptomText.includes('crushing')
    ) {
      return 'cardiac';
    }

    // Respiratory emergencies
    if (
      symptomText.includes('breathing') ||
      symptomText.includes('breath') ||
      symptomText.includes('choking') ||
      symptomText.includes('asthma')
    ) {
      return 'respiratory';
    }

    // Neurological emergencies
    if (
      symptomText.includes('stroke') ||
      symptomText.includes('seizure') ||
      symptomText.includes('unconscious') ||
      symptomText.includes('confusion') ||
      symptomText.includes('slurred speech')
    ) {
      return 'neurological';
    }

    // Bleeding/trauma
    if (
      symptomText.includes('bleeding') ||
      symptomText.includes('blood') ||
      symptomText.includes('cut') ||
      symptomText.includes('wound') ||
      symptomText.includes('trauma')
    ) {
      return 'bleeding';
    }

    // Poisoning
    if (
      symptomText.includes('poison') ||
      symptomText.includes('overdose') ||
      symptomText.includes('toxic')
    ) {
      return 'poisoning';
    }

    // Allergic reaction
    if (
      symptomText.includes('allergic') ||
      symptomText.includes('anaphylaxis') ||
      symptomText.includes('hives') ||
      symptomText.includes('swelling')
    ) {
      return 'allergic';
    }

    // Burns
    if (
      symptomText.includes('burn') ||
      symptomText.includes('scalded')
    ) {
      return 'burn';
    }

    // Fractures
    if (
      symptomText.includes('broken') ||
      symptomText.includes('fracture') ||
      symptomText.includes('bone')
    ) {
      return 'fracture';
    }

    return 'general';
  }

  /**
   * Fallback analysis when AI service is unavailable
   */
  private getFallbackAnalysis(input: SymptomInput): TriageResult {
    console.log('⚠️ Using fallback analysis');

    const isUrgent = input.urgency === 'immediate' || 
                     input.quickSymptoms?.some(s => 
                       s.toLowerCase().includes('chest') ||
                       s.toLowerCase().includes('breath') ||
                       s.toLowerCase().includes('bleeding')
                     );

    return {
      severity: isUrgent ? 'high' : 'medium',
      confidence: 50,
      detectedSymptoms: input.quickSymptoms?.map(s => ({
        keyword: s,
        severity: isUrgent ? 'urgent' : 'moderate'
      })) || [],
      recommendations: [
        '🚨 Emergency services have been notified',
        '📞 Stay calm and follow dispatcher instructions',
        '👁️ Monitor the patient closely',
      ],
      emergencyType: 'general',
    };
  }

  /**
   * Get quick symptom suggestions for the UI
   */
  getQuickSymptomOptions(): string[] {
    return [
      '💔 Chest Pain',
      '🫁 Can\'t Breathe',
      '🩸 Severe Bleeding',
      '🤕 Head Injury',
      '🧠 Unconscious',
      '🔥 Severe Burns',
      '🦴 Broken Bone',
      '🤒 High Fever',
      '😵 Severe Headache',
      '🤮 Poisoning',
      '😰 Seizure',
      '💊 Allergic Reaction',
    ];
  }
}

export const symptomAnalyzer = new SymptomAnalyzer();
