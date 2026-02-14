import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { extractEntities } from '@/lib/extractor';
import { matchSchemes } from '@/lib/matcher';
import { detectLanguage } from '@/lib/language';
import { formatResponse } from '@/lib/formatter';
import { translateWithSarvam } from '@/lib/sarvam-translator';

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await req.formData();
    // console.log(formData)
    const body = formData.get('Body') as string;
    
    if (!body) {
      return createTwiMLResponse("Sorry, I didn't receive your message. Please try again.");
    }
    
    console.log(`Received message: ${body}`);
    
    // Extract entities (age, income)
    const { age, income } = extractEntities(body);
    console.log(`Extracted entities - Age: ${age}, Income: ${income}`);
    
    // Detect language
    const language = detectLanguage(body);
    console.log(`Detected language: ${language}`);
    
    // Match schemes
    const schemes = matchSchemes(body, age, income);
    console.log(`Found ${schemes.length} matching schemes`);
    
    // Format response (always in English first)
    let responseText = formatResponse(schemes, 'en');
    
    // Translate if not English
    if (language !== 'en') {
      console.log(`Translating to ${language} using Sarvam.ai`);
      responseText = await translateWithSarvam(responseText, language);
    }
    
    // Return TwiML
    return createTwiMLResponse(responseText);
    
  } catch (error) {
    console.error('Webhook error:', error);
    return createTwiMLResponse(
      "Sorry, something went wrong. Please try again later."
    );
  }
}

function createTwiMLResponse(message: string): NextResponse {
  const twiml = new MessagingResponse();
  twiml.message(message);
  
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
