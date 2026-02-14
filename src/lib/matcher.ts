import { Scheme } from '@/types/scheme';
import schemesData from '../../public/schemes.json';

interface MatchResult {
  scheme: Scheme;
  score: number;
}

export function matchSchemes(
  query: string,
  age?: number,
  income?: number
): Scheme[] {
  const schemes: Scheme[] = schemesData.schemes as Scheme[];

  // Step 1: Normalize query
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  // Step 2: Calculate relevance scores
  const results: MatchResult[] = schemes.map(scheme => ({
    scheme,
    score: calculateScore(queryWords, scheme.keywords)
  }));

  // Step 3: Filter by score > 0
  let filtered = results.filter(r => r.score > 0);

  // Step 4: Apply eligibility filtering
  if (age !== undefined || income !== undefined) {
    filtered = filtered.filter(r => {
      const { minAge, maxAge, incomeLimit } = r.scheme.eligibility;

      // Age check
      if (age !== undefined) {
        if (minAge !== undefined && age < minAge) return false;
        if (maxAge !== undefined && age > maxAge) return false;
      }

      // Income check
      if (income !== undefined && incomeLimit !== undefined) {
        if (income > incomeLimit) return false;
      }

      return true;
    });
  }

  // Step 5: Sort by relevance and return top 3
  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.scheme);
}

function calculateScore(queryWords: string[], keywords: string[]): number {
  const normalizedKeywords = keywords.map(k => k.toLowerCase());
  let score = 0;

  for (const word of queryWords) {
    for (const keyword of normalizedKeywords) {
      // Bidirectional substring matching
      if (keyword.includes(word) || word.includes(keyword)) {
        score += 1;
      }
    }
  }

  return score;
}
