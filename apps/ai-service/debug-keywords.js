// Debug script to see exact keyword matching
import { keywordMatcher } from "./utils/keywordMatcher.js";
import { scoringService } from "./services/scoringService.js";

const testCases = [
  "severe abdominal pain with fever and vomiting",
  "fever, headache, body aches and cough",
  "runny nose and slight cough",
];

for (const symptoms of testCases) {
  console.log(`\n🔍 Analyzing: "${symptoms}"`);

  const analysis = keywordMatcher.analyze(symptoms);
  console.log("Keywords found:");
  console.log("  Critical:", analysis.critical);
  console.log("  Urgent:", analysis.urgent);
  console.log("  Moderate:", analysis.moderate);
  console.log("  Mild:", analysis.mild);

  const severity = scoringService.calculateSeverity(analysis);
  console.log("  Final severity:", severity);
}
