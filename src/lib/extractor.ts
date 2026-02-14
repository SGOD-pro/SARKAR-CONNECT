/**
 * Entity Extraction Service
 * Extracts age and income from natural language user messages
 * Supports English and Hindi patterns
 */

export interface ExtractedEntities {
  age?: number;
  income?: number;
}

/**
 * Extract age and income entities from user message
 * @param message - User's natural language message
 * @returns Object with optional age and income fields
 */
export function extractEntities(message: string): ExtractedEntities {
  const result: ExtractedEntities = {};

  // Extract age
  const age = extractAge(message);
  if (age !== undefined) {
    result.age = age;
  }

  // Extract income
  const income = extractIncome(message);
  if (income !== undefined) {
    result.income = income;
  }

  return result;
}

/**
 * Extract age from message using multiple patterns
 * Supports: "age 35", "35 years", "I am 45", "मैं 35 साल"
 */
function extractAge(message: string): number | undefined {
  const agePatterns = [
    /age\s+(\d+)/i,                    // "age 35"
    /(\d+)\s+years?\s+old/i,           // "35 years old"
    /(\d+)\s+years?/i,                 // "35 years"
    /i\s+am\s+(\d+)/i,                 // "I am 45"
    /मैं\s+(\d+)\s+साल/,               // "मैं 35 साल"
    /उम्र\s+(\d+)/,                    // "उम्र 35" (age in Hindi)
    /(\d+)\s+साल/,                     // "35 साल"
  ];

  for (const pattern of agePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1], 10);
      // Validate age range (0-120)
      if (!isNaN(age) && age >= 0 && age <= 120) {
        return age;
      }
    }
  }

  return undefined;
}

/**
 * Extract income from message using multiple patterns
 * Supports: "income 15000", "₹15000", "earning 20000", "15000 rupees"
 */
function extractIncome(message: string): number | undefined {
  const incomePatterns = [
    /income\s+(\d+)/i,                 // "income 15000"
    /₹\s*(\d+)/,                       // "₹15000" or "₹ 15000"
    /rs\.?\s*(\d+)/i,                  // "Rs 15000" or "Rs. 15000"
    /earning\s+(\d+)/i,                // "earning 20000"
    /earn\s+(\d+)/i,                   // "earn 20000"
    /(\d+)\s+rupees?/i,                // "15000 rupees"
    /salary\s+(\d+)/i,                 // "salary 15000"
    /आय\s+(\d+)/,                      // "आय 15000" (income in Hindi)
    /कमाई\s+(\d+)/,                    // "कमाई 15000" (earning in Hindi)
  ];

  for (const pattern of incomePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const income = parseInt(match[1], 10);
      // Validate income (must be positive)
      if (!isNaN(income) && income > 0) {
        return income;
      }
    }
  }

  return undefined;
}
