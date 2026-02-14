/**
 * Manual test file for entity extractor
 * Run with: npx tsx src/lib/extractor.test.ts
 */

import { extractEntities } from './extractor';

// Test cases
const testCases = [
  // Age extraction tests
  { input: 'I need farming schemes age 35', expected: { age: 35 } },
  { input: 'health scheme for 45 years old person', expected: { age: 45 } },
  { input: 'I am 60 years', expected: { age: 60 } },
  { input: 'मैं 35 साल का हूं', expected: { age: 35 } },
  { input: 'उम्र 50', expected: { age: 50 } },
  
  // Income extraction tests
  { input: 'income 15000', expected: { income: 15000 } },
  { input: '₹20000 per month', expected: { income: 20000 } },
  { input: 'earning 25000', expected: { income: 25000 } },
  { input: '30000 rupees salary', expected: { income: 30000 } },
  { input: 'Rs 18000', expected: { income: 18000 } },
  
  // Combined tests
  { input: 'farming schemes age 35 income 15000', expected: { age: 35, income: 15000 } },
  { input: 'I am 45 years old earning ₹20000', expected: { age: 45, income: 20000 } },
  
  // Edge cases
  { input: 'farming schemes', expected: {} },
  { input: 'age 150', expected: {} }, // Invalid age
  { input: 'age -5', expected: {} }, // Negative age
  { input: 'income -1000', expected: {} }, // Negative income
  { input: '', expected: {} },
  { input: 'xyz123', expected: {} },
];

console.log('Running Entity Extractor Tests...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = extractEntities(testCase.input);
  const success = JSON.stringify(result) === JSON.stringify(testCase.expected);
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1} passed: "${testCase.input}"`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1} failed: "${testCase.input}"`);
    console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
    console.log(`   Got: ${JSON.stringify(result)}`);
  }
});

console.log(`\n${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
