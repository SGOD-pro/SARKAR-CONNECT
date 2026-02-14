export function detectLanguage(text: string): 'en' | 'hi' {
  // Check for Devanagari script (Hindi)
  const devanagariRegex = /[\u0900-\u097F]/;
  
  if (devanagariRegex.test(text)) {
    return 'hi';
  }
  
  return 'en';
}
