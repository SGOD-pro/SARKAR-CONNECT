import { Scheme } from '@/types/scheme';

export function formatResponse(schemes: Scheme[], language: 'en' | 'hi' = 'en'): string {
  // No matches
  if (schemes.length === 0) {
    return language === 'hi'
      ? "क्षमा करें, कोई योजना नहीं मिली। कृपया प्रयास करें: खेती, स्वास्थ्य, आवास, शिक्षा"
      : "Sorry, no schemes found. Try: farming, health, housing, education, employment";
  }
  
  // Format header
  const header = language === 'hi'
    ? `आपके लिए ${schemes.length} योजनाएं मिलीं:\n\n`
    : `Found ${schemes.length} scheme(s) for you:\n\n`;
  
  // Format each scheme
  const schemesList = schemes.map((scheme, idx) => {
    const emoji = ['1️⃣', '2️⃣', '3️⃣'][idx] || `${idx + 1}.`;
    const name = language === 'hi' ? scheme.nameHindi : scheme.name;
    
    return `${emoji} *${name}*\n` +
           `💰 ${scheme.benefits}\n` +
           `✅ ${formatEligibility(scheme, language)}\n` +
           `📄 ${scheme.documents.slice(0, 2).join(', ')}\n` +
           `🔗 ${scheme.applicationProcess}`;
  }).join('\n\n');
  
  // Footer
  const footer = language === 'hi'
    ? "\n\nअधिक जानकारी के लिए नंबर भेजें (1, 2, 3)"
    : "\n\nReply with number for more details (1, 2, 3)";
  
  return header + schemesList + footer;
}

function formatEligibility(scheme: Scheme, language: 'en' | 'hi'): string {
  const parts: string[] = [];
  const { minAge, maxAge, occupation, incomeLimit } = scheme.eligibility;
  
  if (minAge !== undefined) {
    parts.push(language === 'hi' ? `उम्र: ${minAge}+` : `Age: ${minAge}+`);
  }
  
  if (occupation && occupation.length > 0) {
    parts.push(occupation[0]);
  }
  
  if (incomeLimit !== undefined) {
    parts.push(`Income < ₹${incomeLimit}`);
  }
  
  if (parts.length === 0) {
    return language === 'hi' ? 'सभी नागरिक' : 'All citizens';
  }
  
  return parts.join(', ');
}
