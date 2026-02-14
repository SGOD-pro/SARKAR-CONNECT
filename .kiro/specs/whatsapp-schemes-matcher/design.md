# Design Document -  SARKAR-CONNECT (AI-Optimized)

## Project Overview

**Name:** SarkarConnect (AI for Bharat)
**Purpose:** WhatsApp-based government scheme discovery for rural India
**Timeline:** 24-hour hackathon
**Target Users:** Rural citizens with limited digital literacy, basic phones

---

## Problem Statement

### The Reality
- **₹1.84 lakh crore** in unclaimed welfare funds in India
- **₹78,213 crore** in unclaimed bank deposits (26% YoY growth)
- 40% of eligible farmers don't know about PM-KISAN
- 60% awareness → only 60% uptake among aware households

### Root Causes
1. Information trapped in English PDFs on government websites
2. Complex eligibility criteria not clearly communicated
3. Digital divide: Rural users have basic phones, not smartphones
4. Middlemen charge ₹500 for free schemes (information asymmetry)

### Our Solution
WhatsApp bot that:
- Works on ₹1,500 JioPhones
- Responds in Hindi/regional languages
- Filters by eligibility automatically
- Provides direct application links

---

## Architecture Overview

### High-Level Flow

```
User (WhatsApp) 
    ↓
Twilio WhatsApp API
    ↓
Next.js Webhook (/api/webhook)
    ↓
[Entity Extractor] → age, income
    ↓
[Keyword Matcher] → category detection
    ↓
[Eligibility Filter] → remove unqualified schemes
    ↓
[Response Formatter] → format for WhatsApp
    ↓
TwiML Response
    ↓
Twilio
    ↓
User sees formatted schemes
```

### Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | Single codebase for web + API |
| Language | TypeScript | Type safety, fewer bugs |
| Styling | Tailwind CSS | Fast development |
| Messaging | Twilio WhatsApp API | Easiest WhatsApp integration |
| Database | JSON file | 30 schemes = 100KB, no DB needed |
| Deployment | Vercel | Free, instant Next.js deploy |
| Testing (local) | ngrok | Expose localhost to Twilio |

### Why NOT Other Options

| Rejected | Why Not |
|----------|---------|
| Separate React frontend + FastAPI backend | 2 deployments = 2x complexity |
| MongoDB/PostgreSQL | Database setup = 2 hours wasted for 30 schemes |
| Meta WhatsApp Business API | Requires approval (3+ days) |
| LangChain/OpenAI for matching | Overkill for keyword matching, adds cost + latency |
| React Native app | WhatsApp IS the app, rural users won't download |

---

## System Components

### 1. Scheme Data Model

**File:** `public/schemes.json`

**Structure:**
```json
{
  "schemes": [
    {
      "id": "unique-id",
      "name": "Scheme Name (English)",
      "nameHindi": "योजना का नाम",
      "category": "agriculture | health | housing | education | women | employment | senior",
      "benefits": "What user gets (₹ amount or service)",
      "eligibility": {
        "minAge": 18,           // Optional
        "maxAge": 60,           // Optional
        "occupation": ["farmer"],
        "incomeLimit": 100000,  // Optional (annual)
        "states": "all" | ["UP", "Bihar"]
      },
      "documents": ["Aadhaar", "Bank account"],
      "applicationProcess": "How to apply + URL",
      "keywords": ["english", "hindi", "हिंदी", "slang", "variations"]
    }
  ]
}
```

**Critical Design Decisions:**
- **Keywords are the MOST important field** - matching quality depends on this
- Include common misspellings and regional variations
- Hindi keywords essential (many rural users type in Hindi)
- Optional eligibility fields allow flexibility

**Data Collection:**
Research 30 schemes covering:
- Agriculture: PM-KISAN, Fasal Bima, Soil Health Card, KCC
- Health: Ayushman Bharat, Janani Suraksha, PMJJBY
- Housing: PMAY-G, PMAY-U
- Education: Mid-Day Meal, Scholarships
- Women: Ujjwala, Sukanya Samriddhi, Beti Bachao Beti Padhao
- Employment: MGNREGA, Mudra Yojana, DDU-GKY
- Senior Citizens: PMVVY, NSAP, Vayoshri

---

### 2. Entity Extraction Service

**File:** `src/lib/extractor.ts`

**Purpose:** Extract structured data from natural language

**Inputs:** User message (string)
**Outputs:** `{ age?: number, income?: number }`

**Algorithm:**
```
1. Define regex patterns for age:
   - "age 35"
   - "35 years"
   - "I am 45"
   - "मैं 35 साल"

2. Define regex patterns for income:
   - "income 15000"
   - "₹15000"
   - "earning 20000"
   - "15000 rupees"

3. For each pattern:
   - Try to match
   - Parse number
   - Validate (age: 0-120, income: >0)
   - Return first valid match

4. Return empty object if nothing found
```

**Edge Cases:**
- Invalid numbers → ignore
- Multiple ages in message → take first
- Negative values → ignore
- Very large numbers (income >1 crore) → allow (some users may mistype)

**Example:**
```
Input:  "I need farming schemes age 35 income 15000"
Output: { age: 35, income: 15000 }

Input:  "मुझे खेती के लिए योजना चाहिए, मैं 45 साल का हूं"
Output: { age: 45 }

Input:  "farming schemes"
Output: {}
```

---

### 3. Keyword Matcher Service

**File:** `src/lib/matcher.ts`

**Purpose:** Find schemes matching user query and eligibility

**Inputs:** 
- `query: string` (user message)
- `age?: number` (extracted)
- `income?: number` (extracted)

**Outputs:** `Scheme[]` (top 3 matches)

**Algorithm:**

**Step 1: Keyword Matching**
```
1. Normalize query: lowercase, trim
2. Tokenize: split by spaces
3. For each scheme:
   a. For each query word:
      - Check if any keyword matches (substring)
      - Bidirectional: "farm" matches "farming" and vice versa
   b. Calculate score = number of matches
4. Filter schemes with score > 0
```

**Step 2: Eligibility Filtering**
```
If age provided:
  - Filter out schemes where age < minAge
  - Filter out schemes where age > maxAge

If income provided:
  - Filter out schemes where income > incomeLimit
```

**Step 3: Ranking**
```
1. Sort by score (descending)
2. Take top 3
3. Return
```

**Example:**
```
Query: "farming schemes"
Tokens: ["farming", "schemes"]

Scheme A (PM-KISAN):
  Keywords: ["farmer", "farming", "agriculture", "kisan"]
  Score: 2 (matches "farming" → "farming", "schemes" → none)

Scheme B (Ayushman Bharat):
  Keywords: ["health", "hospital", "insurance"]
  Score: 0 (no matches)

Result: [Scheme A]
```

**With Eligibility:**
```
Query: "farming schemes age 17"
Extracted: { age: 17 }

Scheme A (PM-KISAN):
  minAge: 18
  Score: 2
  Eligible: NO (age < minAge)

Result: [] (filtered out)
```

**Design Decisions:**
- **Simple substring matching** - fast, works well for 30 schemes
- **Bidirectional** - handles partial matches ("farm" → "farming")
- **Score-based ranking** - more keyword matches = more relevant
- **Eligibility AFTER keyword matching** - don't waste time filtering irrelevant schemes

---

### 4. Language Detection Service

**File:** `src/lib/language.ts`

**Purpose:** Detect if user is writing in Hindi

**Algorithm:**
```
1. Check for Devanagari Unicode characters (U+0900 to U+097F)
2. If found: return 'hi'
3. Else: return 'en'
```

**Regex:** `/[\u0900-\u097F]/`

**Examples:**
```
"farming schemes"           → 'en'
"खेती योजना"                → 'hi'
"I am 35 मैं किसान हूं"     → 'hi' (mixed, but has Hindi)
"age 35"                    → 'en'
```

**Limitations:**
- Only detects Hindi in MVP
- Mixed language → defaults to Hindi (safer)
- Other languages (Tamil, Telugu) not detected in MVP

**Future:** Expand to other scripts (Tamil, Bengali, Telugu)

---

### 5. Response Formatter Service

**File:** `src/lib/formatter.ts`

**Purpose:** Format scheme results for WhatsApp display

**Inputs:**
- `schemes: Scheme[]` (matched schemes)
- `language: 'en' | 'hi'` (detected language)

**Outputs:** `string` (formatted message)

**Format:**

**No matches:**
```
Sorry, no schemes found.
Try: farming, health, housing, education, employment
```

**With matches (English):**
```
Found 3 schemes for you:

1️⃣ *PM-Kisan Samman Nidhi*
💰 ₹6,000 per year in 3 installments
✅ Age: 18+, Farmers
📄 Aadhaar, Bank account
🔗 Apply at pmkisan.gov.in

2️⃣ *Fasal Bima Yojana*
💰 Crop insurance for natural disasters
✅ All farmers
📄 Aadhaar, Land records
🔗 Visit nearest bank

3️⃣ *Kisan Credit Card*
💰 Low interest farm loans
✅ Age: 18-75, Farmers with land
📄 Land papers, Bank account
🔗 Visit any bank

Reply with number for more details (1, 2, 3)
```

**With matches (Hindi):**
```
आपके लिए 3 योजनाएं मिलीं:

1️⃣ *पीएम किसान सम्मान निधि*
💰 ₹6,000 प्रति वर्ष
✅ उम्र: 18+, किसान
📄 आधार, बैंक खाता
🔗 pmkisan.gov.in

अधिक जानकारी के लिए नंबर भेजें (1, 2, 3)
```

**Design Decisions:**
- **Emojis** - Visual hierarchy, works on all phones
- **Bold scheme names** - WhatsApp supports *bold*
- **Max 3 schemes** - Prevents information overload
- **Concise** - 4 lines per scheme max
- **Action prompt** - "Reply with number" (future: detailed view)
- **Documents limited to 2** - Space constraint

**Formatting Helper:**
```
formatEligibility(scheme):
  parts = []
  
  if minAge: parts.push("Age: {minAge}+")
  if occupation: parts.push(occupation[0])
  if incomeLimit: parts.push("Income < ₹{incomeLimit}")
  
  if parts.empty: return "All citizens"
  return parts.join(", ")
```

---

### 6. Webhook API Handler

**File:** `src/app/api/webhook/route.ts`

**Purpose:** Receive Twilio WhatsApp messages and respond

**HTTP Method:** POST
**Content-Type:** application/x-www-form-urlencoded (Twilio format)

**Request Format:**
```
POST /api/webhook
Body: From=+919876543210&Body=farming+schemes+age+35
```

**Response Format:** TwiML XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Found 3 schemes for you...</Message>
</Response>
```

**Flow:**
```
1. Parse FormData
   - Extract 'Body' field (user message)
   - Extract 'From' field (user number) - for logging

2. Validate
   - If Body is empty: return error message

3. Extract Entities
   - Call extractEntities(body)
   - Get { age, income }

4. Detect Language
   - Call detectLanguage(body)
   - Get 'en' or 'hi'

5. Match Schemes
   - Call matchSchemes(body, age, income)
   - Get Scheme[]

6. Format Response
   - Call formatResponse(schemes, language)
   - Get formatted string

7. Create TwiML
   - Use Twilio SDK MessagingResponse
   - Return as text/xml

8. Error Handling
   - Catch all errors
   - Return user-friendly error message
   - Log error details
```

**Error Responses:**
```
Missing Body:
  "Sorry, I didn't receive your message. Please try again."

Unexpected Error:
  "Sorry, something went wrong. Please try again later."
```

**Logging:**
```
console.log(`Received: ${body}`)
console.log(`Entities: age=${age}, income=${income}`)
console.log(`Language: ${language}`)
console.log(`Matches: ${schemes.length}`)
```

**Headers:**
```
Content-Type: text/xml
Status: 200 (always, even on error - Twilio requirement)
```

---

## Data Flow Examples

### Example 1: Simple Query
```
User sends: "farming schemes"

1. Webhook receives: Body="farming schemes"
2. Extract entities: {} (no age/income)
3. Detect language: 'en'
4. Match schemes:
   - PM-KISAN: score=2
   - Fasal Bima: score=2
   - KCC: score=1
   → Top 3: [PM-KISAN, Fasal Bima, KCC]
5. Format response (English)
6. Return TwiML

User sees:
"Found 3 schemes for you:
 1️⃣ PM-Kisan..."
```

### Example 2: With Eligibility
```
User sends: "health scheme age 65 income 10000"

1. Webhook receives: Body="health scheme age 65 income 10000"
2. Extract entities: { age: 65, income: 10000 }
3. Detect language: 'en'
4. Match schemes:
   Keyword matches:
   - Ayushman Bharat: score=1
   - PMJJBY: score=1
   - NSAP: score=1
   
   Eligibility filter:
   - Ayushman Bharat: PASS (no age limit, no income limit)
   - PMJJBY: FAIL (maxAge=50)
   - NSAP: PASS (minAge=60, no income limit)
   
   → Top 3: [Ayushman Bharat, NSAP]
5. Format response
6. Return TwiML

User sees:
"Found 2 schemes for you:
 1️⃣ Ayushman Bharat...
 2️⃣ National Social Assistance..."
```

### Example 3: Hindi Query
```
User sends: "मुझे खेती के लिए योजना चाहिए"

1. Webhook receives: Body="मुझे खेती के लिए योजना चाहिए"
2. Extract entities: {} (no numbers)
3. Detect language: 'hi' (Devanagari detected)
4. Match schemes:
   - Keywords include Hindi: ["खेती", "किसान"]
   - PM-KISAN matches: score=2
   → Top 3: [PM-KISAN, Fasal Bima, KCC]
5. Format response (Hindi)
6. Return TwiML

User sees:
"आपके लिए 3 योजनाएं मिलीं:
 1️⃣ पीएम किसान सम्मान निधि..."
```

### Example 4: No Matches
```
User sends: "xyz123"

1. Webhook receives: Body="xyz123"
2. Extract entities: {}
3. Detect language: 'en'
4. Match schemes: [] (no keyword matches)
5. Format response: "Sorry, no schemes found..."
6. Return TwiML

User sees:
"Sorry, no schemes found.
 Try: farming, health, housing..."
```

---

## Deployment Architecture

### Local Development
```
Developer Machine:
  - Next.js running on localhost:3000
  - ngrok tunnel: https://abc123.ngrok.io
  
Twilio:
  - Webhook URL: https://abc123.ngrok.io/api/webhook
  - When message arrives → POST to webhook
  
WhatsApp:
  - User sends to Twilio number
  - Twilio forwards to webhook
  - Webhook responds with TwiML
  - Twilio sends formatted message back
```

### Production Deployment
```
Vercel:
  - Deploy Next.js app
  - Auto-assigns URL: https://ai-for-bharat.vercel.app
  
Twilio:
  - Update webhook: https://ai-for-bharat.vercel.app/api/webhook
  
GitHub:
  - Push code
  - Vercel auto-deploys
  - Zero downtime
```

---

## Security & Privacy

### What We DON'T Store
- ❌ User phone numbers (except in logs)
- ❌ User messages (except in logs)
- ❌ Personal information
- ❌ Conversation history

### Why Stateless Design
- Each request is independent
- No sessions, no cookies
- No user tracking
- Privacy by default

### Twilio Security
- Webhook signature verification (optional in MVP)
- HTTPS only
- Sandboxed environment for testing

---

## Performance Considerations

### Response Time Target
- **Goal:** <2 seconds from user send to response
- **Breakdown:**
  - Network (user → Twilio): ~200ms
  - Twilio → Webhook: ~100ms
  - Processing (entity extraction + matching + formatting): ~50ms
  - Webhook → Twilio: ~100ms
  - Twilio → User: ~200ms
  - **Total:** ~650ms ✅

### Optimization Strategies
1. **JSON in memory** - No database queries
2. **Simple string matching** - No AI/ML latency
3. **Edge deployment** - Vercel edge functions
4. **Minimal dependencies** - Fast cold starts

### Scalability
**Current Setup:**
- Handles 100 requests/second easily
- 30 schemes × 10 keywords = 300 comparisons per query
- O(n*m) complexity where n=schemes, m=query words
- For 30 schemes: ~1ms matching time

**Future:**
- If 10,000 schemes: Need indexing (Elasticsearch)
- If 1M users/day: Need caching layer
- **MVP:** 30 schemes, 100 users/day → current design perfect

---

## Testing Strategy

### Manual Testing (Required)

**Test Cases:**
1. Simple query: "farming schemes"
2. With age: "health scheme age 65"
3. With income: "scheme for farmers income 15000"
4. With both: "housing age 30 income 20000"
5. Hindi: "खेती योजना"
6. No matches: "xyz123"
7. Edge cases: empty message, very long message, special characters

**Test with:**
- WhatsApp (Twilio sandbox)
- Curl (local testing)
- Postman (API testing)

### Automated Testing (Optional)

**If AI generates automatically:**
- Unit tests for matcher
- Unit tests for extractor
- Integration test for webhook

**If slows down development:**
- Skip automated tests
- Focus on manual testing

---

## Future Enhancements (Post-Hackathon)

### Phase 2 Features
1. **Conversation Memory**
   - Remember user's last query
   - "Tell me more about scheme 1"
   
2. **Voice Input**
   - Already works (Twilio auto-transcribes)
   - Just needs testing

3. **Regional Languages**
   - Tamil, Telugu, Bengali, Marathi
   - Google Translate API integration

4. **Aadhaar Verification**
   - Auto-check eligibility via government API
   - "Are you eligible? Send your Aadhaar number"

5. **Proactive Notifications**
   - "PM-KISAN application deadline: 3 days"
   - Seasonal reminders (harvest time, tax filing)

6. **Application Assistance**
   - Step-by-step guide
   - Document upload via WhatsApp
   - Status tracking

### Scalability Improvements
1. Database (PostgreSQL/MongoDB) for 1000+ schemes
2. Search indexing (Elasticsearch)
3. Caching layer (Redis)
4. Load balancing
5. Analytics dashboard

---

## Success Metrics

### Demo Success
- ✅ Live WhatsApp demo works
- ✅ Responds in <2 seconds
- ✅ No crashes on any input
- ✅ Hindi responses work
- ✅ Eligibility filtering accurate

### Hackathon Win Criteria
- ✅ Solves real problem (unclaimed funds)
- ✅ Novel approach (WhatsApp, not app)
- ✅ Actually works (live demo)
- ✅ Scalable (535M WhatsApp users)
- ✅ Feasible cost (₹0.30 per conversation)

---

## Troubleshooting Guide

### Common Issues

**Issue:** Webhook not receiving messages
**Solution:** Check ngrok URL, verify Twilio webhook config

**Issue:** Hindi responses not working
**Solution:** Check language detection regex, verify scheme nameHindi

**Issue:** No schemes matching
**Solution:** Add more keywords to schemes.json, check case sensitivity

**Issue:** TwiML error
**Solution:** Verify XML format, check Content-Type header

**Issue:** Deployment fails
**Solution:** Check Vercel logs, verify package.json dependencies

---

## Appendix: Code Examples

### Full Webhook Example
```typescript
// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { extractEntities } from '@/lib/extractor';
import { matchSchemes } from '@/lib/matcher';
import { detectLanguage } from '@/lib/language';
import { formatResponse } from '@/lib/formatter';

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = formData.get('Body') as string;
    
    if (!body) {
      return createTwiMLResponse("Sorry, I didn't receive your message.");
    }
    
    const { age, income } = extractEntities(body);
    const language = detectLanguage(body);
    const schemes = matchSchemes(body, age, income);
    const responseText = formatResponse(schemes, language);
    
    return createTwiMLResponse(responseText);
  } catch (error) {
    console.error('Error:', error);
    return createTwiMLResponse("Sorry, something went wrong.");
  }
}

function createTwiMLResponse(message: string): NextResponse {
  const twiml = new MessagingResponse();
  twiml.message(message);
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' }
  });
}
```

---

**Document Version:** 1.0 (AI-Optimized for 24-hour hackathon)
**Last Updated:** Pre-hackathon planning phase