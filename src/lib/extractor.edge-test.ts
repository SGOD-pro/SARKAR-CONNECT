/**
 * Additional edge case tests for entity extractor
 */

import { extractEntities } from './extractor';

console.log('Testing additional edge cases...\n');

// Test multiple ages in message (should take first)
console.log('Test: Multiple ages');
console.log('Input: "I am 35 but my father is 60"');
console.log('Result:', extractEntities('I am 35 but my father is 60'));
console.log('Expected: { age: 35 } (first match)\n');

// Test multiple incomes (should take first)
console.log('Test: Multiple incomes');
console.log('Input: "income 15000 but need 20000"');
console.log('Result:', extractEntities('income 15000 but need 20000'));
console.log('Expected: { income: 15000 } (first match)\n');

// Test very large income (should allow)
console.log('Test: Large income');
console.log('Input: "income 10000000"');
console.log('Result:', extractEntities('income 10000000'));
console.log('Expected: { income: 10000000 } (allowed)\n');

// Test boundary age values
console.log('Test: Boundary age 0');
console.log('Input: "age 0"');
console.log('Result:', extractEntities('age 0'));
console.log('Expected: { age: 0 } (valid)\n');

console.log('Test: Boundary age 120');
console.log('Input: "age 120"');
console.log('Result:', extractEntities('age 120'));
console.log('Expected: { age: 120 } (valid)\n');

console.log('Test: Boundary age 121');
console.log('Input: "age 121"');
console.log('Result:', extractEntities('age 121'));
console.log('Expected: {} (invalid)\n');

// Test special characters
console.log('Test: Special characters');
console.log('Input: "age@35#income$15000"');
console.log('Result:', extractEntities('age@35#income$15000'));
console.log('Expected: {} (no match due to special chars)\n');

// Test with proper spacing
console.log('Test: Proper spacing with special chars');
console.log('Input: "age 35 & income ₹15000"');
console.log('Result:', extractEntities('age 35 & income ₹15000'));
console.log('Expected: { age: 35, income: 15000 }\n');

// Test case insensitivity
console.log('Test: Case insensitivity');
console.log('Input: "AGE 35 INCOME 15000"');
console.log('Result:', extractEntities('AGE 35 INCOME 15000'));
console.log('Expected: { age: 35, income: 15000 }\n');

// Test Hindi with English numbers
console.log('Test: Mixed Hindi-English');
console.log('Input: "मुझे खेती योजना चाहिए मैं 45 साल का हूं आय 20000"');
console.log('Result:', extractEntities('मुझे खेती योजना चाहिए मैं 45 साल का हूं आय 20000'));
console.log('Expected: { age: 45, income: 20000 }\n');

console.log('✅ All edge case tests completed!');
