/**
 * TypeScript interfaces for SarkarConnect WhatsApp Bot
 * Defines core data structures for government schemes and user queries
 */

/**
 * Eligibility criteria for a government scheme
 */
export interface Eligibility {
  minAge?: number;
  maxAge?: number;
  occupation?: string[];
  incomeLimit?: number;
  states?: string | string[];
}

/**
 * Government scheme data structure
 */
export interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  category: 'agriculture' | 'health' | 'housing' | 'education' | 'women' | 'employment' | 'senior';
  benefits: string;
  eligibility: Eligibility;
  documents: string[];
  applicationProcess: string;
  keywords: string[];
}

/**
 * User query with extracted entities
 */
export interface UserQuery {
  age?: number;
  income?: number;
}

/**
 * Match result with scheme and relevance score
 */
export interface MatchResult {
  scheme: Scheme;
  score: number;
}
