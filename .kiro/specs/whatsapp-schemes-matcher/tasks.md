# Implementation Tasks - AI for Bharat (UPDATED with Sarvam.ai)

## Overview

This task list is optimized for AI code generation tools (Cursor, Copilot, v0, etc.).
**NEW:** Phase 2 now includes Sarvam.ai integration for Indian language support.

**Execution Strategy:**
1. Phase 1 (Tasks 1-9) ✅ COMPLETE
2. Phase 2 (Tasks 10-17) ⏳ IN PROGRESS
3. Test after each task
4. 6 hours remaining

---

## PHASE 1: CORE MVP ✅ COMPLETE

Tasks 1-9 are complete. Do not modify.

---

## PHASE 2: WINNING ADDITIONS (Priority: CRITICAL)

---

### Task 10: Add Sarvam.ai Translation (CRITICAL - DO FIRST)

**Time:** 1 hour
**Dependencies:** Phase 1 complete
**Priority:** HIGHEST (Judges will love Indian AI)

#### Step 1: Get Sarvam.ai API Key (15 minutes)

**Manual Steps:**
1. Go to https://www.sarvam.ai/
2. Click "Get Started" or "API Access"
3. Sign up with email
4. Verify email
5. Go to Dashboard
6. Find "API Keys" section
7. Click "Generate New Key"
8. Copy the API key (starts with `sarvam_`)
9. Save it securely

#### Step 2: Add Environment Variable (2 minutes)

**File:** `.env.local`

**Add this line:**
```env
SARVAM_API_KEY=your_actual_api_key_here
```

**Replace `your_actual_api_key_here` with the key you copied**

**IMPORTANT:** Do NOT commit this file to GitHub. It's already in `.gitignore`.

#### Step 3: Create Sarvam.ai Translator (15 minutes)

**File:** `src/lib/sarvam-translator.ts`

**Prompt for AI:**
```
Create a new file src/lib/sarvam-translator.ts with the following function:

translateWithSarvam(text: string, targetLang: string): Promise<string>

Requirements:
1. If targetLang is 'en', return text unchanged
2. Map targetLang codes to Sarvam.ai format:
   - 'hi' → 'hi-IN' (Hindi)
   - 'ta' → 'ta-IN' (Tamil)
   - 'te' → 'te-IN' (Telugu)
   - 'bn' → 'bn-IN' (Bengali)
   - 'mr' → 'mr-IN' (Marathi)
   - 'gu' → 'gu-IN' (Gujarati)
   - 'kn' → 'kn-IN' (Kannada)
   - 'ml' → 'ml-IN' (Malayalam)
   - 'pa' → 'pa-IN' (Punjabi)
   - 'or' → 'or-IN' (Odia)

3. Call Sarvam.ai API:
   - Endpoint: https://api.sarvam.ai/translate
   - Method: POST
   - Headers:
     - Content-Type: application/json
     - API-Subscription-Key: process.env.SARVAM_API_KEY
   - Body:
     - input: text
     - source_language_code: 'en-IN'
     - target_language_code: mapped language
     - speaker_gender: 'Male'
     - mode: 'formal'
     - model: 'mayura:v1'
     - enable_preprocessing: true

4. Return translated_text from response
5. On error, log and return original text (fallback)
6. Use try-catch for error handling
```

**Complete Code:**
```typescript
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
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'or': 'or-IN'
  };
  
  const targetLangCode = langMap[targetLang] || 'hi-IN';
  
  try {
    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': process.env.SARVAM_API_KEY!
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
      throw new Error(`Sarvam API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translated_text || text;
    
  } catch (error) {
    console.error('Sarvam translation error:', error);
    // Fallback to original text
    return text;
  }
}
```

#### Step 4: Update Language Detector (10 minutes)

**File:** `src/lib/language.ts`

**Current Code:**
```typescript
export function detectLanguage(text: string): 'en' | 'hi' {
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return 'hi';
  }
  return 'en';
}
```

**Updated Code:**
```typescript
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
  
  // Marathi (uses Devanagari, but check separately if needed)
  // For now, Marathi uses same detection as Hindi
  
  // Default to English
  return 'en';
}
```

**Prompt for AI:**
```
Update src/lib/language.ts to detect 10 Indian languages using Unicode ranges:
- Hindi: U+0900 to U+097F
- Tamil: U+0B80 to U+0BFF
- Telugu: U+0C00 to U+0C7F
- Bengali: U+0980 to U+09FF
- Gujarati: U+0A80 to U+0AFF
- Kannada: U+0C80 to U+0CFF
- Malayalam: U+0D00 to U+0D7F
- Punjabi: U+0A00 to U+0A7F
- Odia: U+0B00 to U+0B7F
Return language code as string (hi, ta, te, bn, gu, kn, ml, pa, or, en)
Default to 'en' if no match
```

#### Step 5: Update Formatter to Accept String Language (5 minutes)

**File:** `src/lib/formatter.ts`

**Change function signature:**

**FROM:**
```typescript
export function formatResponse(schemes: Scheme[], language: 'en' | 'hi' = 'en'): string
```

**TO:**
```typescript
export function formatResponse(schemes: Scheme[], language: string = 'en'): string
```

**Prompt for AI:**
```
In src/lib/formatter.ts, change the language parameter type from 'en' | 'hi' to string.
This allows it to accept any language code (ta, te, bn, etc.)
Keep all logic the same, just change the type signature.
```

#### Step 6: Update Webhook to Use Sarvam.ai (15 minutes)

**File:** `src/app/api/webhook/route.ts`

**Current Code:**
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
    const formData = await req.formData();
    const body = formData.get('Body') as string;
    
    if (!body) {
      return createTwiMLResponse("Sorry, I didn't receive your message. Please try again.");
    }
    
    console.log(`Received message: ${body}`);
    
    const { age, income } = extractEntities(body);
    console.log(`Extracted entities - Age: ${age}, Income: ${income}`);
    
    const language = detectLanguage(body);
    console.log(`Detected language: ${language}`);
    
    const schemes = matchSchemes(body, age, income);
    console.log(`Found ${schemes.length} matching schemes`);
    
    const responseText = formatResponse(schemes, language);
    
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

**Updated Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { extractEntities } from '@/lib/extractor';
import { matchSchemes } from '@/lib/matcher';
import { detectLanguage } from '@/lib/language';
import { formatResponse } from '@/lib/formatter';
import { translateWithSarvam } from '@/lib/sarvam-translator'; // NEW

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = formData.get('Body') as string;
    
    if (!body) {
      return createTwiMLResponse("Sorry, I didn't receive your message. Please try again.");
    }
    
    console.log(`Received message: ${body}`);
    
    const { age, income } = extractEntities(body);
    console.log(`Extracted entities - Age: ${age}, Income: ${income}`);
    
    const language = detectLanguage(body);
    console.log(`Detected language: ${language}`);
    
    const schemes = matchSchemes(body, age, income);
    console.log(`Found ${schemes.length} matching schemes`);
    
    // Format response (always in English first)
    let responseText = formatResponse(schemes, 'en');
    
    // Translate if not English
    if (language !== 'en') {
      console.log(`Translating to ${language} using Sarvam.ai`);
      responseText = await translateWithSarvam(responseText, language);
    }
    
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

**Changes:**
1. Import `translateWithSarvam`
2. Always format in English first
3. Detect language
4. If not English, translate using Sarvam.ai
5. Return translated response

**Prompt for AI:**
```
Update src/app/api/webhook/route.ts:
1. Import translateWithSarvam from '@/lib/sarvam-translator'
2. After formatResponse, add translation logic:
   - Format response in English first
   - If language !== 'en', call translateWithSarvam(responseText, language)
   - Log translation attempt
3. Keep all error handling the same
```

#### Step 7: Test Locally (10 minutes)

**Commands:**
```bash
# Start dev server
npm run dev

# In another terminal, test with curl
curl -X POST http://localhost:3000/api/webhook \
  -d "Body=farming schemes age 35" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Expected Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Found 3 scheme(s) for you:...</Message>
</Response>
```

**Check Logs:**
```
Received message: farming schemes age 35
Extracted entities - Age: 35, Income: undefined
Detected language: en
Found 3 matching schemes
```

**Acceptance Criteria:**
- ✅ No TypeScript errors
- ✅ Server starts without crashes
- ✅ Curl returns TwiML
- ✅ Logs show correct flow
- ✅ If language is 'en', no translation call

---

### Task 11: ngrok Testing (CRITICAL)

**Time:** 45 minutes
**Dependencies:** Task 10 complete
**Priority:** CRITICAL (Must work before deployment)

#### Step 1: Install & Start ngrok (10 minutes)

**Option A: Using npx (No installation)**
```bash
npx ngrok http 3000
```

**Option B: Install globally**
```bash
npm install -g ngrok
ngrok http 3000
```

**Expected Output:**
```
ngrok                                                                           

Session Status                online
Account                       your@email.com (Plan: Free)
Version                       3.x.x
Region                        India (in)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**COPY THIS URL:** `https://abc123.ngrok-free.app`

**Important:** Keep this terminal open! If you close it, the tunnel stops.

#### Step 2: Configure Twilio Webhook (10 minutes)

**Manual Steps:**
1. Go to https://console.twilio.com/
2. Click **Messaging** in left sidebar
3. Click **Try it out** → **Send a WhatsApp message**
4. Scroll to **Sandbox Settings**
5. Find **"When a message comes in"** field
6. Enter: `https://YOUR-NGROK-URL/api/webhook`
   - Replace YOUR-NGROK-URL with your actual ngrok URL
   - Example: `https://abc123.ngrok-free.app/api/webhook`
7. Click **Save**

**Verify Configuration:**
- Webhook URL should show your ngrok URL
- Method should be POST
- Status should be Active

#### Step 3: Join Twilio Sandbox (5 minutes)

**On Your Phone:**
1. Open WhatsApp
2. Add this number to contacts: **+1 415 523 8886**
   - Save as "Twilio Sandbox" or similar
3. Send a message: `join <your-code>`
   - Your code is shown in Twilio Console
   - Example: `join happy-tiger`
4. You should receive: "You are now connected to your Twilio Sandbox"

#### Step 4: Test End-to-End (15 minutes)

**Test 1: Simple English Query**
```
You send: farming schemes
Expected: Response with PM-KISAN and 2 other schemes
```

**Check ngrok logs:**
- In ngrok terminal, you should see incoming POST request
- Status: 200
- Path: /api/webhook

**Check Next.js logs:**
```
Received message: farming schemes
Detected language: en
Found 3 matching schemes
```

**Test 2: With Eligibility**
```
You send: health age 65 income 10000
Expected: Response with age-appropriate health schemes
```

**Test 3: Hindi Query**
```
You send: खेती योजना
Expected: Response in Hindi (Sarvam.ai translated)
```

**Check logs:**
```
Received message: खेती योजना
Detected language: hi
Found X matching schemes
Translating to hi using Sarvam.ai
```

**Test 4: Tamil Query (if you know Tamil)**
```
You send: விவசாய திட்டங்கள்
Expected: Response in Tamil
```

**Test 5: No Match**
```
You send: xyz123
Expected: "Sorry, no schemes found..."
```

**Test 6: Error Handling**
```
You send: (empty message or special characters)
Expected: Graceful error message
```

#### Step 5: Record Demo Video (5 minutes)

**While testing:**
1. **Screen record your phone** (iOS: built-in, Android: use screen recorder app)
2. Show these interactions:
   - English query → English response
   - Hindi query → Hindi response
   - Show eligibility filtering working
3. **Save this video** for presentation backup

**Recording Tips:**
- Clean up phone UI (turn on Do Not Disturb)
- Good lighting on screen
- Steady hand or use tripod/stand
- Portrait orientation
- Keep video under 60 seconds

#### Acceptance Criteria:

- ✅ WhatsApp message reaches webhook
- ✅ English queries work
- ✅ Hindi queries get translated responses
- ✅ Eligibility filtering works (age, income)
- ✅ Error handling works (no crashes)
- ✅ Response time < 3 seconds
- ✅ Demo video recorded

**If ANY test fails:**
- Check ngrok is still running
- Check Twilio webhook URL is correct
- Check .env.local has SARVAM_API_KEY
- Check Next.js logs for errors
- Check ngrok dashboard: http://127.0.0.1:4040

---

### Task 12: Deploy to Vercel (CRITICAL)

**Time:** 30 minutes
**Dependencies:** Task 11 passed
**Priority:** CRITICAL

#### Step 1: Prepare for Deployment (5 minutes)

**Check .gitignore includes:**
```
.env
.env.local
.env*.local
```

**Commit everything:**
```bash
git add .
git commit -m "Add Sarvam.ai translation + 31 schemes - ready for deploy"
git push origin main
```

**If you haven't initialized git:**
```bash
git init
git add .
git commit -m "Initial commit - SarkarConnect MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### Step 2: Deploy to Vercel (10 minutes)

**Manual Steps:**
1. Go to https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repo
5. Vercel will auto-detect Next.js
6. Click **"Deploy"**

**Wait for deployment (2-3 minutes)**

You'll see:
- Building... ⏳
- Deployed! ✅
- Your URL: `https://sarkarconnect.vercel.app` (or similar)

#### Step 3: Add Environment Variables (5 minutes)

**After deployment:**
1. Go to your project in Vercel
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add variable:
   - **Name:** `SARVAM_API_KEY`
   - **Value:** (paste your Sarvam.ai API key)
   - **Environments:** Production, Preview, Development (check all)
5. Click **"Save"**

**IMPORTANT:** After adding env variable, you must **redeploy**:
1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

#### Step 4: Update Twilio Webhook (5 minutes)

**In Twilio Console:**
1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Scroll to **Sandbox Settings**
3. Update **"When a message comes in"**:
   - **FROM:** `https://abc123.ngrok-free.app/api/webhook`
   - **TO:** `https://sarkarconnect.vercel.app/api/webhook`
     - (Use YOUR actual Vercel URL)
4. Click **"Save"**

**You can now stop ngrok** (Ctrl+C in that terminal)

#### Step 5: Test Production Deployment (5 minutes)

**On WhatsApp:**
1. Send: `farming schemes age 35`
2. **You should get response from production**

**If it doesn't work:**
- Check Vercel deployment logs
- Verify SARVAM_API_KEY is set in Vercel
- Check Twilio webhook URL is correct
- Check for any errors in Vercel Function logs

**Check Vercel Logs:**
1. Go to Vercel dashboard
2. Click your project
3. Click **"Deployments"**
4. Click latest deployment
5. Click **"Functions"** tab
6. Find `/api/webhook`
7. Click to see logs

#### Acceptance Criteria:

- ✅ Deployed to Vercel successfully
- ✅ SARVAM_API_KEY environment variable set
- ✅ Twilio webhook updated to production URL
- ✅ WhatsApp messages reach production
- ✅ Responses working same as local
- ✅ Translation working (Hindi, Tamil, etc.)

**Your production URL:**
Save this URL - you'll need it for presentation!

---

### Task 13: Update PPT with Demo Slide

**Time:** 30 minutes
**Dependencies:** Task 12 complete

#### What to Add:

**NEW SLIDE (Insert after Slide 3):**

**Slide 3.5: "Live Demo"**

**Left Side:**
- Screenshot of WhatsApp showing English query
- Screenshot of WhatsApp showing Hindi response
- Highlight Sarvam.ai logo

**Right Side:**
- Large QR code linking to WhatsApp
- Text: "Scan to Try Live"
- WhatsApp number: +1 415 523 8886
- Join code: (your code)

**Bottom:**
- "Powered by Sarvam.ai - Indian AI for 10+ Languages"

**UPDATE SLIDE 4:**

**Change this section:**
```
Stack:
- Twilio WhatsApp API Integration
- Deterministic Eligibility Engine (Rule-based, Explainable)
- Lightweight AI for Clarity (Not Hallucination-prone)
```

**To:**
```
Stack:
- Twilio WhatsApp API Integration
- Sarvam.ai Translation (Indian AI - 10+ Regional Languages)
- Entity Extraction Engine (Age, Income from Natural Language)
- Intelligent Keyword Matching + Eligibility Filter
- Next.js Serverless Backend (Vercel)
```

**Add architecture diagram showing:**
```
User → WhatsApp → Twilio → Next.js API
                              ↓
                   [Entity Extractor]
                              ↓
              [Keyword Matcher + Eligibility Filter]
                              ↓
                   [Sarvam.ai Translation]
                              ↓
              Response → Twilio → WhatsApp
```

#### Acceptance:
- ✅ Demo slide added with screenshots
- ✅ Sarvam.ai mentioned prominently
- ✅ QR code working (test it!)
- ✅ Architecture diagram clear

---

### Task 14: Record Final Demo Video

**Time:** 45 minutes
**Dependencies:** Task 12 complete

#### Shot List:

**Shot 1: Title (5 sec)**
- Text: "SarkarConnect - From Awareness to Access"
- Team name

**Shot 2: Problem (15 sec)**
- Text overlay: "₹1.84 lakh crore unclaimed"
- Text: "40% farmers don't know about schemes"

**Shot 3: WhatsApp Demo - English (20 sec)**
- Screen record phone
- Send: "farming schemes age 35"
- Show response with 3 schemes
- Highlight formatting (emojis, structure)

**Shot 4: WhatsApp Demo - Hindi (15 sec)**
- Send: "खेती योजना"
- Show Hindi response
- Text overlay: "Powered by Sarvam.ai (Indian AI)"

**Shot 5: Landing Page (10 sec)**
- Show browser with your deployed site
- Scroll through scheme browser

**Shot 6: Technology (15 sec)**
- Architecture diagram animation
- Text: "Next.js + Twilio + Sarvam.ai"

**Shot 7: Impact (10 sec)**
- Text overlays:
  - "535M WhatsApp users"
  - "₹0.30 per query"
  - "31 schemes indexed"

**Shot 8: Call to Action (10 sec)**
- QR code
- Text: "Try it now"
- Your WhatsApp number

**Total:** 90 seconds

#### Tools:
- **Recording:** Phone screen recorder
- **Editing:** CapCut (mobile) or iMovie (Mac) or Shotcut (free, desktop)
- **Export:** 1080p MP4

#### Acceptance:
- ✅ 60-90 second video
- ✅ Clear demo of WhatsApp working
- ✅ Shows Hindi translation
- ✅ Professional quality (no shaky camera, clear audio)
- ✅ Exported as MP4

---

### Task 15: Practice Pitch

**Time:** 1 hour
**Dependencies:** Tasks 13, 14 complete

#### 5-Minute Pitch Structure:

**[0:00-1:00] Problem**
- Open with story: "Meet Ramesh, a farmer..."
- Statistics: "₹1.84 lakh crore unclaimed"
- Why current solutions fail

**[1:00-2:30] Solution + Demo**
- "We built SarkarConnect"
- WhatsApp-first approach
- Play demo video OR live demo
- Emphasize: "Works on ₹1,500 phones"

**[2:30-3:30] Technology**
- "Powered by Sarvam.ai - Indian AI"
- Architecture: Simple, scalable, serverless
- "31 schemes, <50ms matching"

**[3:30-4:30] Impact + Differentiation**
- "535M WhatsApp users vs 50M app users"
- Table: WhatsApp vs Apps comparison
- Cost: "₹0.30 per query"

**[4:30-5:00] Close**
- Future roadmap: Aadhaar integration, more languages
- Call to action: "Scan QR, try it now"
- "From awareness to access - in one message"

#### Practice Routine:

**Run 1-3:** Read through, no timer
**Run 4-6:** Time yourself, adjust pacing
**Run 7-9:** Practice with demo video
**Run 10:** Final run, record yourself

#### Q&A Prep:

**Q: Why Sarvam.ai over Google Translate?**
**A:** "Three reasons: 1) Built for Indian languages - better accuracy for Hindi, Tamil, regional variations. 2) Supports 10+ Indian languages natively. 3) Supports Atmanirbhar Bharat - Indian AI for Indian problems."

**Q: How do you prevent AI hallucinations?**
**A:** "We use AI strategically, not everywhere. Eligibility is rule-based (deterministic). Translation is the only AI component (Sarvam.ai). Matching uses keyword algorithms, not generative AI. This ensures accuracy where it matters most."

**Q: Scalability?**
**A:** "Current: 100 req/sec, 31 schemes, serverless Next.js on Vercel. For 1000+ schemes, we'd add search indexing (Elasticsearch). For 1M+ users, add Redis caching. Architecture designed for horizontal scaling."

**Q: What if Sarvam.ai goes down?**
**A:** "Graceful degradation. If API fails, we return English response. We can cache common translations. Can switch to Google Translate with one env variable change. In production, we'd add circuit breakers."

**Q: Business model?**
**A:** "Phase 1: Government partnership (free for citizens). Phase 2: B2B SaaS for NGOs, CSR programs at ₹2.30 per query (₹0.30 cost + margin). Phase 3: Premium features (Aadhaar verification, application tracking)."

#### Acceptance:
- ✅ Can deliver 5-min pitch smoothly
- ✅ Demo video plays without issues
- ✅ Q&A answers memorized
- ✅ Confident with live demo backup

---

## FINAL PRE-SUBMISSION CHECKLIST

**Code & Deployment:**
- [ ] 31 schemes in schemes.json
- [ ] Sarvam.ai integration working
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] WhatsApp responding to queries
- [ ] Hindi translation working
- [ ] Other languages (Tamil, Telugu) working

**Demo Materials:**
- [ ] Demo video recorded (90 sec)
- [ ] PPT updated with demo slide
- [ ] QR code tested and working
- [ ] Screenshots of WhatsApp conversation
- [ ] Architecture diagram added

**Presentation:**
- [ ] 5-min pitch practiced
- [ ] Q&A answers prepared
- [ ] Live demo tested on actual phone
- [ ] Backup video ready if live fails

**Testing:**
- [ ] English query works
- [ ] Hindi query works (Sarvam.ai)
- [ ] Eligibility filtering works (age, income)
- [ ] Error handling works (invalid input)
- [ ] Response time < 3 seconds
- [ ] Mobile responsive landing page

---

## DEBUGGING GUIDE

### Issue: "Sarvam API returns 401 Unauthorized"
**Solution:**
1. Check SARVAM_API_KEY in .env.local
2. Verify API key is correct (copy from Sarvam dashboard)
3. In Vercel, check environment variable is set
4. Redeploy after adding env variable

### Issue: "Translation not working"
**Solution:**
1. Check console logs: "Translating to hi using Sarvam.ai"
2. If not logging, language detection failed
3. Check detectLanguage function
4. Test with known Hindi text: "मैं किसान हूं"

### Issue: "WhatsApp not responding"
**Solution:**
1. Check Twilio webhook URL is correct
2. Verify it's HTTPS (ngrok or Vercel)
3. Check webhook URL ends with /api/webhook
4. Test with curl first locally
5. Check Twilio console for errors

### Issue: "Deployment failed on Vercel"
**Solution:**
1. Check build logs in Vercel
2. Ensure all dependencies in package.json
3. Check TypeScript errors
4. Verify .env variables locally work
5. Try `npm run build` locally first

### Issue: "Response is slow (>5 seconds)"
**Solution:**
1. Check Sarvam API response time
2. Reduce number of schemes matched
3. Add timeout to translation (fallback after 3s)
4. Check Vercel function region (should be India)

---

## TIME BREAKDOWN (Remaining 6 Hours)

**Hour 1: Sarvam.ai Integration**
- Get API key: 15 min
- Write code: 30 min
- Test locally: 15 min

**Hour 2: ngrok Testing**
- Setup ngrok: 10 min
- Configure Twilio: 10 min
- End-to-end testing: 20 min
- Record demo on phone: 20 min

**Hour 3: Deployment**
- Deploy to Vercel: 15 min
- Configure env variables: 10 min
- Update Twilio webhook: 5 min
- Test production: 10 min
- Fix any issues: 20 min

**Hour 4: PPT & Demo Video**
- Update PPT: 20 min
- Record demo video: 30 min
- Edit video: 10 min

**Hour 5: Practice**
- Practice pitch: 40 min
- Q&A prep: 20 min

**Hour 6: Buffer**
- Fix last-minute bugs
- Final testing
- Relax before presentation

---

## SUCCESS CRITERIA

**You WIN if:**
- ✅ Live WhatsApp demo works
- ✅ Sarvam.ai translation impresses judges
- ✅ Clear differentiation (WhatsApp vs apps)
- ✅ Professional presentation
- ✅ Confident Q&A answers
- ✅ 31 schemes show comprehensiveness

**What Makes You STAND OUT:**
- ✅ Indian AI (Sarvam.ai) - judges will LOVE this
- ✅ Actually working demo (many teams won't)
- ✅ Real accessibility (feature phones, regional languages)
- ✅ Clear social impact (₹1.84L Cr unclaimed)

---

**NOW GO EXECUTE. 6 HOURS. YOU'VE GOT THIS.** 🚀