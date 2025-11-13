import { triageService } from '../services/triageService.js';

/**
 * Test suite for NLP-enhanced triage system
 * Demonstrates improvements over basic keyword matching
 */

console.log('🧪 NLP-Enhanced Triage System Test Suite\n');
console.log('='.repeat(80));

const testCases = [
  {
    name: 'Synonym Detection',
    description: 'Testing if system recognizes medical synonyms',
    symptoms: "I can't catch my breath and my heart is racing",
    expectedImprovement: 'Should match "difficulty breathing" and "heart attack" keywords via synonyms',
  },
  {
    name: 'Negation Handling',
    description: 'Testing if system excludes negated symptoms',
    symptoms: "I have a headache but no chest pain and no difficulty breathing",
    expectedImprovement: 'Should NOT trigger cardiac or respiratory alerts',
  },
  {
    name: 'Severity Modifiers - Intensifiers',
    description: 'Testing if system recognizes severity modifiers',
    symptoms: "Extreme crushing chest pain, worst pain of my life",
    expectedImprovement: 'Should upgrade severity due to "extreme" and "worst"',
  },
  {
    name: 'Severity Modifiers - Reducers',
    description: 'Testing if system handles mild symptoms',
    symptoms: "Mild headache and slight fever",
    expectedImprovement: 'Should downgrade severity due to "mild" and "slight"',
  },
  {
    name: 'Temporal Detection - Acute',
    description: 'Testing acute onset detection',
    symptoms: "Suddenly started having severe chest pain 10 minutes ago",
    expectedImprovement: 'Should detect acute onset and increase urgency',
  },
  {
    name: 'Temporal Detection - Chronic',
    description: 'Testing chronic symptom detection',
    symptoms: "I've had this headache for weeks now",
    expectedImprovement: 'Should detect chronic timeline',
  },
  {
    name: 'Medical Entity Extraction',
    description: 'Testing body part and symptom extraction',
    symptoms: "Pain in my chest, left arm, and jaw with sweating",
    expectedImprovement: 'Should extract body parts: chest, arm, jaw',
  },
  {
    name: 'Sentiment Analysis - High Distress',
    description: 'Testing emotional distress detection',
    symptoms: "Terrible pain, can't stand it, feel like I'm dying",
    expectedImprovement: 'Should detect high distress level',
  },
  {
    name: 'Complex Multi-symptom',
    description: 'Testing complex symptom combination',
    symptoms: "Severe headache with confusion, slurred speech, and weakness on right side started suddenly",
    expectedImprovement: 'Should recognize stroke symptoms with acute onset',
  },
  {
    name: 'Contextual Understanding',
    description: 'Testing context awareness',
    symptoms: "Burning pain in chest after eating spicy food",
    expectedImprovement: 'Should consider context (after eating = possibly acid reflux)',
  },
];

async function runTests() {
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Symptoms: "${testCase.symptoms}"`);
    console.log(`Expected: ${testCase.expectedImprovement}`);
    console.log('-'.repeat(80));

    try {
      // Test with NLP enabled
      console.log('\n✨ WITH NLP:');
      const nlpResult = await triageService.analyze(testCase.symptoms, {}, true);
      console.log(`Severity: ${nlpResult.severity.toUpperCase()}`);
      console.log(`Confidence: ${nlpResult.confidence}%`);
      console.log(`Detected Symptoms: ${nlpResult.detectedSymptoms.map(s => s.keyword).join(', ')}`);
      
      if (nlpResult.nlpInsights) {
        console.log('\n🔍 NLP Insights:');
        console.log(`  - Entities: ${JSON.stringify(nlpResult.nlpInsights.entities)}`);
        console.log(`  - Severity Multiplier: ${nlpResult.nlpInsights.severity.multiplier}x`);
        console.log(`  - Temporal: ${JSON.stringify(nlpResult.nlpInsights.temporal)}`);
        console.log(`  - Sentiment: ${nlpResult.nlpInsights.sentiment.interpretation} (score: ${nlpResult.nlpInsights.sentiment.score})`);
        console.log(`  - Negations: ${nlpResult.nlpInsights.negations.hasNegations ? nlpResult.nlpInsights.negations.negatedTerms.join(', ') : 'None'}`);
        console.log(`  - Expanded Terms: ${nlpResult.nlpInsights.expandedTerms.length} synonyms added`);
      }
      
      console.log('\n📋 Recommendations:');
      nlpResult.recommendations.forEach(rec => console.log(`  - ${rec}`));

      // Compare with basic keyword matching
      console.log('\n\n🔤 WITHOUT NLP (Basic Keywords):');
      const basicResult = await triageService.analyze(testCase.symptoms, {}, false);
      console.log(`Severity: ${basicResult.severity.toUpperCase()}`);
      console.log(`Confidence: ${basicResult.confidence}%`);
      console.log(`Detected Symptoms: ${basicResult.detectedSymptoms.map(s => s.keyword).join(', ') || 'None'}`);

      // Show comparison
      console.log('\n📊 COMPARISON:');
      const severityChanged = nlpResult.severity !== basicResult.severity;
      const confidenceChanged = nlpResult.confidence !== basicResult.confidence;
      const symptomsChanged = nlpResult.detectedSymptoms.length !== basicResult.detectedSymptoms.length;

      if (severityChanged) {
        console.log(`  ✓ Severity changed: ${basicResult.severity} → ${nlpResult.severity}`);
      }
      if (confidenceChanged) {
        console.log(`  ✓ Confidence changed: ${basicResult.confidence}% → ${nlpResult.confidence}%`);
      }
      if (symptomsChanged) {
        console.log(`  ✓ Symptoms detected changed: ${basicResult.detectedSymptoms.length} → ${nlpResult.detectedSymptoms.length}`);
      }
      if (!severityChanged && !confidenceChanged && !symptomsChanged) {
        console.log(`  - No changes (NLP didn't improve this case)`);
      }

    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      console.error(error.stack);
    }

    console.log('\n' + '='.repeat(80));
  }

  console.log('\n\n✅ Test Suite Complete!\n');
  console.log('Summary:');
  console.log('- The NLP system enhances the rule-based triage with:');
  console.log('  1. Synonym expansion (recognizes variations of medical terms)');
  console.log('  2. Negation detection (excludes symptoms that are explicitly denied)');
  console.log('  3. Severity modifiers (intensifiers and reducers)');
  console.log('  4. Temporal analysis (acute vs chronic)');
  console.log('  5. Entity extraction (body parts, symptoms)');
  console.log('  6. Sentiment analysis (emotional distress)');
  console.log('  7. Context awareness (improving accuracy)\n');
}

// Run the tests
runTests().catch(console.error);
