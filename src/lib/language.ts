/**
 * Detect language from text based on Unicode script ranges
 * Supports 10+ Indian languages
 */
export function detectLanguage(text: string): string {
  // Hindi (Devanagari)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  
  // Odia
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or';
  
  // Marathi uses Devanagari (same as Hindi)
  // Will be detected as 'hi' but can be handled separately if needed
  
  // Default to English
  return 'en';
}
