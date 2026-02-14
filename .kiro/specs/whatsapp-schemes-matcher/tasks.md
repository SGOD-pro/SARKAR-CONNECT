# Implementation Tasks - AI for Bharat (AI-Optimized)

## Overview

This task list is optimized for AI code generation tools (Cursor, Copilot, v0, etc.).
Each task is atomic, has clear inputs/outputs, and references specific requirements.

**Execution Strategy:**
1. Complete Phase 1 (Tasks 1-8) before moving to Phase 2
2. Test after each checkpoint
3. Skip optional tasks if running out of time

---

## PHASE 1: CORE MVP (Priority: CRITICAL)

### Task 1: Project Setup
**Time:** 30 minutes
**Dependencies:** None

**Steps:**
```bash
# Create Next.js project
npx create-next-app@latest ai-for-bharat --typescript --tailwind --app --src-dir

# Install dependencies
cd ai-for-bharat
npm install twilio
npm install -D @types/node

# Create folder structure
mkdir -p src/lib src/types public
```

**Acceptance:**
- ✅ Next.js app runs on localhost:3000
- ✅ TypeScript enabled
- ✅ Tailwind working
- ✅ Folder structure created

**Requirements:** Setup foundation

---

### Task 2: Define TypeScript Interfaces
**Time:** 15 minutes
**Dependencies:** Task 1

**File:** `src/types/scheme.ts`

**Code to generate:**
```typescript
export interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  category: 'agriculture' | 'health' | 'housing' | 'education' | 'women' | 'employment' | 'senior';
  benefits: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    occupation?: string[];
    incomeLimit?: number;
    states?: string | string[];
  };
  documents: string[];
  applicationProcess: string;
  keywords: string[];
}

export interface UserQuery {
  message: string;
  age?: number;
  income?: number;
  language?: 'en' | 'hi';
}

export interface ExtractedEntities {
  age?: number;
  income?: number;
}
```

**Acceptance:**
- ✅ File compiles without errors
- ✅ All interfaces exported
- ✅ Optional fields marked with `?`

**Requirements:** R7

---

### Task 3: Create Schemes Database (CRITICAL)
**Time:** 3 hours
**Dependencies:** Task 2

**File:** `public/schemes.json`

**Instructions for AI:**
Create JSON file with 30 government schemes. Each scheme must include:

**Required schemes (minimum 10):**
1. PM-Kisan Samman Nidhi (agriculture)
2. MGNREGA (employment)
3. Ayushman Bharat (health)
4. Pradhan Mantri Awas Yojana (housing)
5. PM Ujjwala Yojana (women)
6. National Social Assistance Programme (senior)
7. PM Fasal Bima Yojana (agriculture)
8. e-Shram Card (employment)
9. DDU-GKY (education)
10. National Rural Livelihood Mission (women)

**Add 20 more schemes** from categories: agriculture, health, housing, education, women welfare, employment, senior citizens.

**Example structure:**
```json
{
  "schemes": [
    {
      "id": "pm-kisan",
      "name": "PM-Kisan Samman Nidhi",
      "nameHindi": "पीएम किसान सम्मान निधि",
      "category": "agriculture",
      "benefits": "₹6,000 per year in 3 installments of ₹2,000 each",
      "eligibility": {
        "minAge": 18,
        "occupation": ["farmer", "agricultural laborer"],
        "incomeLimit": null,
        "states": "all"
      },
      "documents": ["Aadhaar card", "Bank account details", "Land ownership papers"],
      "applicationProcess": "Visit nearest Common Service Center or apply online at pmkisan.gov.in",
      "keywords": [
        "farmer", "farming", "agriculture", "kisan", "crop", "land", "खेती", "किसान", "कृषि", "fasal", "खेत"
      ]
    }
  ]
}
```

**Critical points:**
- Include BOTH English and Hindi keywords
- Add slang/common terms (e.g., "ghar" for housing, "dawai" for medicine)
- Be specific about eligibility (age ranges, income limits)
- Include actual government website URLs

**Acceptance:**
- ✅ 30 schemes minimum
- ✅ All required fields present
- ✅ Keywords include English + Hindi
- ✅ Valid JSON (no syntax errors)

**Requirements:** R1

---

### Task 4: Build Entity Extractor
**Time:** 1 hour
**Dependencies:** Task 2

**File:** `src/lib/extractor.ts`

**Code to generate:**
```typescript
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
```

**Test cases to verify:**
- `extractEntities("age 35")` → `{ age: 35 }`
- `extractEntities("income 15000")` → `{ income: 15000 }`
- `extractEntities("I am 45 earning ₹20000")` → `{ age: 45, income: 20000 }`
- `extractEntities("farming schemes")` → `{}`

**Acceptance:**
- ✅ Extracts age from multiple formats
- ✅ Extracts income from multiple formats
- ✅ Returns empty object if nothing found
- ✅ Handles edge cases (invalid numbers, negative values)

**Requirements:** R2

---

### Task 5: Build Keyword Matcher with Eligibility Filter
**Time:** 2 hours
**Dependencies:** Task 2, Task 3

**File:** `src/lib/matcher.ts`

**Code to generate:**
```typescript
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
  const schemes: Scheme[] = schemesData.schemes;
  
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
```

**Test cases to verify:**
- `matchSchemes("farming schemes")` → Returns PM-KISAN and others
- `matchSchemes("health", 65, 5000)` → Returns schemes for seniors with low income
- `matchSchemes("xyz123")` → Returns empty array
- `matchSchemes("farmer", 17)` → Filters out schemes with minAge: 18

**Acceptance:**
- ✅ Case-insensitive matching
- ✅ Returns top 3 schemes
- ✅ Filters by age if provided
- ✅ Filters by income if provided
- ✅ Returns empty array if no matches
- ✅ Never crashes (handles invalid input)

**Requirements:** R3

---

### Task 6: Build Language Detector
**Time:** 30 minutes
**Dependencies:** Task 2

**File:** `src/lib/language.ts`

**Code to generate:**
```typescript
export function detectLanguage(text: string): 'en' | 'hi' {
  // Check for Devanagari script (Hindi)
  const devanagariRegex = /[\u0900-\u097F]/;
  
  if (devanagariRegex.test(text)) {
    return 'hi';
  }
  
  return 'en';
}
```

**Test cases:**
- `detectLanguage("farming schemes")` → `'en'`
- `detectLanguage("खेती योजना")` → `'hi'`
- `detectLanguage("age 35")` → `'en'`

**Acceptance:**
- ✅ Detects Hindi text correctly
- ✅ Defaults to English
- ✅ Handles mixed text (returns 'hi' if any Hindi characters)

**Requirements:** R6

---

### Task 7: Build Response Formatter
**Time:** 1.5 hours
**Dependencies:** Task 2

**File:** `src/lib/formatter.ts`

**Code to generate:**
```typescript
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
```

**Test cases:**
- `formatResponse([], 'en')` → "Sorry, no schemes found..."
- `formatResponse([pmKisan, mgnrega], 'en')` → Formatted with emojis
- `formatResponse([ayushman], 'hi')` → Hindi response

**Acceptance:**
- ✅ Shows "no matches" message when empty
- ✅ Formats up to 3 schemes
- ✅ Uses emojis for clarity
- ✅ Supports Hindi responses
- ✅ Keeps each scheme under 5 lines

**Requirements:** R5

---

### Task 8: Build Twilio Webhook Handler
**Time:** 2 hours
**Dependencies:** Tasks 4, 5, 6, 7

**File:** `src/app/api/webhook/route.ts`

**Code to generate:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { extractEntities } from '@/lib/extractor';
import { matchSchemes } from '@/lib/matcher';
import { detectLanguage } from '@/lib/language';
import { formatResponse } from '@/lib/formatter';

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await req.formData();
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
    
    // Format response
    const responseText = formatResponse(schemes, language);
    
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
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -d "Body=farming schemes age 35" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Acceptance:**
- ✅ Receives POST requests
- ✅ Extracts Body field
- ✅ Calls all services correctly
- ✅ Returns valid TwiML XML
- ✅ Handles errors gracefully
- ✅ Logs for debugging

**Requirements:** R4

---

### CHECKPOINT 1: Core MVP Complete

**Test checklist:**
- [ ] WhatsApp sandbox configured with ngrok URL
- [ ] Send "farming schemes" → Get PM-KISAN response
- [ ] Send "health age 65" → Get senior schemes
- [ ] Send "xyz123" → Get "no schemes found" message
- [ ] Send Hindi text → Get Hindi response
- [ ] No crashes on any input

**If all tests pass:** Move to Phase 2
**If tests fail:** Debug before proceeding

---

## PHASE 2: WINNING ADDITIONS (Priority: HIGH)

### Task 9: Build Landing Page
**Time:** 3 hours
**Dependencies:** Checkpoint 1 passed

**File:** `src/app/page.tsx`

**Sections to include:**
1. Hero with CTA
2. Problem statement (with statistics)
3. How it works (3 steps)
4. Try it now (instructions + QR code)
5. Scheme browser (list of 30 schemes)
6. Impact metrics

**Code framework:**
```typescript
import { Scheme } from '@/types/scheme';
import schemesData from '../../public/schemes.json';

export default function Home() {
  const schemes: Scheme[] = schemesData.schemes;
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Government Schemes<br/>
            <span className="text-green-600">In Your Language</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ₹1.84 lakh crore in welfare funds goes unclaimed. 
            We're changing that with WhatsApp.
          </p>
          <a 
            href="https://wa.me/14155238886?text=join%20YOUR-CODE" 
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-green-700"
          >
            Try WhatsApp Bot →
          </a>
        </div>
      </section>
      
      {/* Stats */}
      {/* How it works */}
      {/* Scheme browser */}
    </main>
  );
}
```

**Acceptance:**
- ✅ Responsive design (mobile + desktop)
- ✅ All 30 schemes displayed
- ✅ Working WhatsApp link
- ✅ Statistics included
- ✅ Clean, professional look

**Requirements:** R8

---

### Task 10: Add Translation (Optional)
**Time:** 2 hours
**Dependencies:** Checkpoint 1 passed

**File:** `src/lib/translator.ts`

**Instructions:**
Use Google Translate API to translate final responses.
Only implement if time permits.

**Requirements:** R10

---

### Task 11: Add Admin Dashboard (Optional)
**Time:** 3 hours
**Dependencies:** Task 9

**File:** `src/app/admin/page.tsx`

**Only build if:**
- All other tasks complete
- 4+ hours remaining
- No critical bugs

**Requirements:** R11

---

## PHASE 3: PRESENTATION (Priority: CRITICAL)

### Task 12: Create Demo Video
**Time:** 1 hour

**Record:**
1. WhatsApp conversation (30 seconds)
2. Landing page tour (30 seconds)
3. Voice input demo (if implemented) (30 seconds)

**Requirements:** Demo backup if live fails

---

### Task 13: Create Presentation Slides
**Time:** 2 hours

**5 slides:**
1. Problem (with statistics)
2. Solution (core features)
3. Demo (live or video)
4. Impact (reach + cost)
5. Future scope

**Requirements:** Judging presentation

---

### Task 14: Practice Pitch
**Time:** 1 hour

**Practice 10 times:**
- 5-minute version
- 3-minute version
- 1-minute elevator pitch

---

## FINAL CHECKLIST

**Before demo:**
- [ ] WhatsApp bot responding correctly
- [ ] Landing page deployed (Vercel)
- [ ] Demo video recorded (backup)
- [ ] Presentation slides ready
- [ ] Tested on judge's phone (if possible)
- [ ] Have 2 friends ready to test during demo
- [ ] Phone charged, WiFi tested
- [ ] ngrok/deployed URL working

---

## TIME ALLOCATION

**Phase 1 (Core MVP):** 10-12 hours
- Task 1: 0.5h
- Task 2: 0.25h
- Task 3: 3h
- Task 4: 1h
- Task 5: 2h
- Task 6: 0.5h
- Task 7: 1.5h
- Task 8: 2h
- Testing: 1h

**Phase 2 (Additions):** 3-6 hours
- Task 9: 3h
- Tasks 10-11: Optional

**Phase 3 (Presentation):** 4 hours
- Tasks 12-14: 4h

**Buffer:** 2-4 hours for bugs and unexpected issues

**Total:** 22-24 hours