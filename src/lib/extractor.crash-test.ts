/**
 * Test that extractor doesn't crash on invalid/malicious input
 */

import { extractEntities } from './extractor';

console.log('Testing crash resistance...\n');

const crashTests = [
  null,
  undefined,
  '',
  '   ',
  '\n\n\n',
  'a'.repeat(10000), // Very long string
  '🎉🎊💰✅📄', // Only emojis
  '<script>alert("xss")</script>',
  'age NaN',
  'income Infinity',
  'age 1e100',
  'मैं'.repeat(1000), // Long Hindi text
  '123456789012345678901234567890', // Very large number
];

let passed = 0;
let crashed = 0;

crashTests.forEach((test, index) => {
  try {
    const result = extractEntities(test as any);
    console.log(`✅ Test ${index + 1} passed (no crash): ${typeof test === 'string' ? test.substring(0, 50) : test}`);
    console.log(`   Result: ${JSON.stringify(result)}`);
    passed++;
  } catch (error) {
    console.log(`❌ Test ${index + 1} CRASHED: ${test}`);
    console.log(`   Error: ${error}`);
    crashed++;
  }
});

console.log(`\n${passed} passed, ${crashed} crashed out of ${crashTests.length} tests`);

if (crashed === 0) {
  console.log('\n🎉 No crashes! Extractor is robust.');
  process.exit(0);
} else {
  console.log('\n❌ Some tests caused crashes');
  process.exit(1);
}
