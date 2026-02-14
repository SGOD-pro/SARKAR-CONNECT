/**
 * Sarvam.ai Translation Service
 * Translates text from English to Indian languages using Sarvam.ai API
 */

export async function translateWithSarvam(
  text: string,
  targetLang: string
): Promise<string> {
  // Return English as-is
  if (targetLang === 'en') {
    return text;
  }
  
  // Map language codes to Sarvam.ai format
  const langMap: Record<string, string> = {
    'hi': 'hi-IN',  // Hindi
    'ta': 'ta-IN',  // Tamil
    'te': 'te-IN',  // Telugu
    'bn': 'bn-IN',  // Bengali
    'mr': 'mr-IN',  // Marathi
    'gu': 'gu-IN',  // Gujarati
    'kn': 'kn-IN',  // Kannada
    'ml': 'ml-IN',  // Malayalam
    'pa': 'pa-IN',  // Punjabi
    'or': 'od-IN',  // Odia (note: Sarvam uses 'od-IN')
    'as': 'as-IN',  // Assamese
    'ur': 'ur-IN',  // Urdu
  };
  
  const targetLangCode = langMap[targetLang] || 'hi-IN';
  
  try {
    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_AI!
      },
      body: JSON.stringify({
        input: text,
        source_language_code: 'en-IN',
        target_language_code: targetLangCode,
        speaker_gender: 'Male',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.translated_text || text;
    
  } catch (error) {
    console.error('Sarvam translation error:', error);
    // Fallback to original text on error
    return text;
  }
}
