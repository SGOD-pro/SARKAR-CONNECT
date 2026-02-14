# Requirements Document - SARKAR-CONNECT (24-Hour MVP)

## Project Context

**Goal:** WhatsApp-based government scheme discovery for rural India
**Timeline:** 24 hours (hackathon)
**Tech Stack:** Next.js 14, TypeScript, Twilio, JSON database
**Priority:** Working demo > Perfect code

---

## PHASE 1: CORE MVP (12 hours) - MUST HAVE

### R1: Scheme Data Storage

**User Story:** Store 30 government schemes in structured JSON format

**Acceptance Criteria:**
1. File located at `public/schemes.json`
2. Each scheme MUST have:
   - `id` (string, unique)
   - `name` (string)
   - `nameHindi` (string)
   - `category` (string: agriculture|health|housing|education|women|employment|senior)
   - `benefits` (string, what user gets)
   - `eligibility` (object with optional: minAge, maxAge, occupation[], incomeLimit, states)
   - `documents` (string[], required docs)
   - `applicationProcess` (string, how to apply)
   - `keywords` (string[], for matching - CRITICAL)

3. Start with 30 schemes minimum
4. NO database needed (just load JSON)
5. NO validation needed in MVP (add later)

**Implementation Note for AI:**
- Create schemes.json in public folder
- Use research from earlier conversation (PM-KISAN, MGNREGA, Ayushman Bharat, etc.)
- Add extensive keywords in English + Hindi

---

### R2: Entity Extraction from User Messages

**User Story:** Extract age, income from natural language queries

**Acceptance Criteria:**
1. Function `extractEntities(message: string)` returns `{ age?: number, income?: number }`
2. Extract age from patterns:
   - "age 35"
   - "35 years"
   - "I am 45"
3. Extract income from patterns:
   - "income 15000"
   - "₹15000"
   - "earning 20000"
4. Return undefined if not found
5. Handle edge cases (no crash on invalid input)

**Implementation Note for AI:**
- Use regex patterns
- File: `src/lib/extractor.ts`
- Keep it simple - exact matches, no NLP

---

### R3: Keyword Matching with Eligibility Filter

**User Story:** Match user queries to relevant schemes they qualify for

**Acceptance Criteria:**
1. Function `matchSchemes(query: string, age?: number, income?: number)` returns `Scheme[]`
2. Keyword matching:
   - Case-insensitive
   - Match if ANY query word matches ANY keyword
   - Calculate relevance score (more matches = higher score)
3. Eligibility filtering:
   - If age provided, filter by minAge/maxAge
   - If income provided, filter by incomeLimit
   - Only return schemes user qualifies for
4. Return top 3 schemes sorted by relevance
5. Return empty array if no matches

**Implementation Note for AI:**
- File: `src/lib/matcher.ts`
- Use simple substring matching (keyword.includes(queryWord) || queryWord.includes(keyword))
- NO fuzzy matching needed for MVP
- Two-step process: keyword match → eligibility filter → sort → top 3

---

### R4: WhatsApp Webhook Handler

**User Story:** Receive WhatsApp messages via Twilio and respond

**Acceptance Criteria:**
1. API route at `src/app/api/webhook/route.ts`
2. Handle POST requests from Twilio
3. Extract message from form data: `Body` field
4. Call entity extractor → matcher → formatter
5. Return TwiML XML response
6. Handle errors gracefully (return friendly message, don't crash)

**Implementation Note for AI:**
- Use Next.js App Router API route format
- Parse FormData: `const body = formData.get('Body')`
- Response format: TwiML XML with proper headers
- Error handling: try-catch with fallback message

---

### R5: Response Formatting

**User Story:** Format scheme results for WhatsApp display

**Acceptance Criteria:**
1. Function `formatResponse(schemes: Scheme[], language: string)` returns string
2. If schemes.length === 0: Return "No schemes found. Try: farming, health, housing"
3. If schemes found: Format as:
   ```
   Found 3 schemes for you:

   1️⃣ PM-KISAN
   💰 ₹6,000 per year
   ✅ Eligibility: Farmers with <2 hectare land
   📄 Documents: Aadhaar, Bank account
   🔗 Apply: pmkisan.gov.in

   Reply with number (1-3) for details
   ```
4. Use emojis for visual clarity
5. Include only top 3 schemes
6. Keep each scheme under 4 lines

**Implementation Note for AI:**
- File: `src/lib/formatter.ts`
- Simple string concatenation
- NO HTML, plain text only
- Emojis: 1️⃣2️⃣3️⃣💰✅📄🔗

---

### R6: Language Detection (Basic)

**User Story:** Detect if user is writing in Hindi and respond accordingly

**Acceptance Criteria:**
1. Function `detectLanguage(text: string)` returns 'en' | 'hi'
2. If text contains Devanagari characters (Unicode range U+0900 to U+097F): return 'hi'
3. Otherwise: return 'en'
4. Use detected language in formatter

**Implementation Note for AI:**
- File: `src/lib/language.ts`
- Simple regex: `/[\u0900-\u097F]/`
- For MVP, only support Hindi detection
- Translation in Phase 2

---

### R7: TypeScript Interfaces

**User Story:** Type safety for development

**Acceptance Criteria:**
1. File: `src/types/scheme.ts`
2. Define `Scheme` interface matching JSON structure
3. Define `UserQuery` interface
4. Define `MatchResult` interface
5. Export all interfaces

**Implementation Note for AI:**
- Use TypeScript interfaces (not types)
- Make optional fields optional (minAge?, maxAge?)
- Keep it simple

---

## PHASE 2: WINNING ADDITIONS (If time permits - 8 hours)

### R8: Landing Page

**Priority:** HIGH (judges can test it)

**Acceptance Criteria:**
1. Single page at `src/app/page.tsx`
2. Sections:
   - Hero with "Try WhatsApp Bot" CTA
   - Statistics (₹1.84 lakh crore unclaimed)
   - How it works (3 steps)
   - Live demo preview
   - Scheme browser (table of 30 schemes)
3. Mobile-responsive (Tailwind)
4. Deploy instructions in page

**Implementation Note for AI:**
- Use Tailwind utility classes
- NO custom CSS files
- Keep it simple and clean
- Focus on clarity over beauty

---

### R9: Voice Input Support (Optional)

**Priority:** MEDIUM (wow factor)

**Acceptance Criteria:**
1. Twilio auto-transcribes voice notes
2. Webhook handles transcribed text same as regular messages
3. No extra work needed (Twilio does the work)

**Implementation Note for AI:**
- Just document that it works
- Test with actual voice note
- No code changes needed

---

### R10: Multi-Language Translation (Optional)

**Priority:** MEDIUM (scale story)

**Acceptance Criteria:**
1. Use Google Translate API for responses
2. Translate formatted response to detected language
3. Support: Hindi, Tamil, Telugu, Bengali
4. Fallback to English if API fails

**Implementation Note for AI:**
- File: `src/lib/translator.ts`
- Use Google Cloud Translate API (free tier)
- Only translate final response, not keywords

---

### R11: Admin Dashboard (Optional)

**Priority:** LOW (only if everything else done)

**Acceptance Criteria:**
1. Page at `src/app/admin/page.tsx`
2. Display all 30 schemes in table
3. Basic CRUD (add/edit/delete)
4. Export to JSON
5. No authentication needed (hackathon demo)

**Implementation Note for AI:**
- Simple HTML table with Tailwind
- Update schemes.json file
- Client-side only (no API needed)

---

## NON-REQUIREMENTS (DO NOT BUILD)

These are EXPLICITLY excluded for 24-hour timeline:

❌ Property-based testing (waste of time)
❌ Unit test coverage >80% (nice to have, not critical)
❌ User authentication (not needed)
❌ Database integration (JSON is fine)
❌ Payment processing (schemes are free)
❌ Mobile app (WhatsApp IS the app)
❌ Complex NLP/ML (keyword matching works)
❌ Session management (stateless is fine)
❌ Rate limiting (not needed for demo)
❌ Logging infrastructure (console.log is fine)

---

## TESTING STRATEGY (Minimal for Speed)

### Manual Testing (Required)
1. Test WhatsApp bot with 10 queries
2. Test edge cases: empty message, Hindi text, numbers only
3. Test eligibility filtering with age/income
4. Record demo video

### Automated Testing (Optional)
1. Only if AI generates them automatically
2. Basic smoke tests for matcher
3. Skip if it slows you down

---

## SUCCESS CRITERIA

**MVP is complete when:**
✅ WhatsApp bot responds to "farming schemes"
✅ Returns PM-KISAN and 2 other schemes
✅ Eligibility filter works (age/income)
✅ Hindi detection works
✅ No crashes on invalid input
✅ Can demo live to judges

**Winning solution includes:**
✅ All MVP features working
✅ Landing page deployed
✅ 30+ schemes indexed
✅ Demo video recorded
✅ Presentation slides ready

---

## FILE STRUCTURE

```
ai-for-bharat/
├── public/
│   └── schemes.json              ← 30 schemes (CRITICAL)
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Landing page (Phase 2)
│   │   ├── admin/
│   │   │   └── page.tsx          ← Admin panel (Phase 2, optional)
│   │   └── api/
│   │       └── webhook/
│   │           └── route.ts      ← Twilio webhook (CRITICAL)
│   ├── lib/
│   │   ├── extractor.ts          ← Entity extraction (CRITICAL)
│   │   ├── matcher.ts            ← Keyword matching (CRITICAL)
│   │   ├── formatter.ts          ← Response formatting (CRITICAL)
│   │   ├── language.ts           ← Language detection
│   │   └── translator.ts         ← Google Translate (Phase 2)
│   └── types/
│       └── scheme.ts             ← TypeScript types
├── package.json
└── README.md
```

---

## GLOSSARY

- **Scheme**: Government welfare program
- **Matcher**: Component that finds relevant schemes
- **Webhook**: API endpoint receiving Twilio messages
- **TwiML**: Twilio's XML response format
- **Entity**: Extracted data (age, income) from user message
- **Eligibility Filter**: Logic that removes schemes user doesn't qualify for

---

## AI GENERATION INSTRUCTIONS

When generating code from these requirements:

1. **Start with Phase 1** - complete all R1-R7 before moving to Phase 2
2. **Use TypeScript** - strict mode enabled
3. **Use Next.js 14 App Router** - not Pages Router
4. **Keep functions pure** - no side effects where possible
5. **Error handling** - try-catch blocks, never crash
6. **Comments** - brief explanations for complex logic
7. **No external dependencies** unless specified (Twilio, Google Translate)
8. **Optimize for speed** - simple solutions over clever ones

---

## PRIORITY ORDER

1. **MUST HAVE** (Phase 1): R1, R2, R3, R4, R5, R6, R7
2. **SHOULD HAVE** (Phase 2): R8 (landing page)
3. **NICE TO HAVE** (Phase 2): R9, R10
4. **SKIP IF NO TIME** (Phase 2): R11

---

Total estimated time:
- Phase 1 (MVP): 10-12 hours
- Phase 2 (Landing page): 3-4 hours
- Phase 2 (Extras): 2-3 hours
- Testing & fixes: 2-3 hours
- Presentation prep: 3-4 hours
- **Buffer**: 2 hours