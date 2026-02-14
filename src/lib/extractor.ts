import { ExtractedEntities } from '@/types/scheme';

export function extractEntities(message: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  
  // Extract age
  const agePatterns = [
    /age[\s:]*(\d+)/i,           // "age 35" or "age: 35"
    /(\d+)[\s]*(?:year|yr|साल)/i, // "35 years" or "35 साल"
    /I am (\d+)/i,                // "I am 45"
    /मैं (\d+)/,                   // "मैं 35"
  ];
  
  for (const pattern of agePatterns) {
    const match = message.match(pattern);
    if (match) {
      const age = parseInt(match[1]);
      if (!isNaN(age) && age > 0 && age < 120) {
        entities.age = age;
        break;
      }
    }
  }
  
  // Extract income
  const incomePatterns = [
    /income[\s:]*(\d+)/i,        // "income 15000"
    /₹[\s]*(\d+)/,                // "₹15000"
    /(?:earn|salary)[\s:]*(\d+)/i, // "earning 20000"
    /(\d+)[\s]*(?:rupee|rs)/i,   // "15000 rupees"
  ];
  
  for (const pattern of incomePatterns) {
    const match = message.match(pattern);
    if (match) {
      const income = parseInt(match[1]);
      if (!isNaN(income) && income > 0) {
        entities.income = income;
        break;
      }
    }
  }
  
  return entities;
}
