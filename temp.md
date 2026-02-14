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

⚠️ Tasks 1–9 remain EXACTLY as previously defined and are NOT modified.

---

## PHASE 2: WINNING ADDITIONS (Priority: HIGH)

---

### Task 10: Add Translation (Optional)

**Time:** 2 hours
**Dependencies:** Checkpoint 1 passed

**File:** `src/lib/translator.ts`

**Instructions:**
Use Google Cloud Translate API to translate final formatted WhatsApp responses.

**Scope:**

* Translate ONLY the final formatted response
* Do NOT translate matching logic or keywords
* Fallback to English if translation fails

**Implementation Requirements:**

1. Create function:

   ```ts
   export async function translateText(
     text: string,
     targetLang: string
   ): Promise<string>
   ```
2. Read API key from environment variable
3. Wrap API call in try-catch
4. Return original text if API fails

**Supported Languages (Minimum):**

* Hindi (hi)
* Tamil (ta)
* Telugu (te)
* Bengali (bn)

**Webhook Integration:**

* Detect language first
* If language !== 'en'

  * Call translateText(responseText, detectedLanguage)
* Send translated output in TwiML

**Acceptance:**

* English query → English response
* Hindi query → Hindi response
* If API fails → English fallback
* No crashes if translation service unavailable

**Requirements:** R10

---

### Task 11: Multi-Turn Conversation + Detailed View

**Time:** 2 hours
**Dependencies:** Task 8 completed

**File:** `src/lib/session.ts`

**Instructions:**
Implement basic session memory to support numeric replies (1, 2, 3).

**Implementation Requirements:**

1. Create in-memory Map<string, UserSession>
2. Store last 3 scheme IDs per phone number
3. If user sends "1", "2", or "3" → return detailed scheme view
4. Add "back" command → return previous list
5. Expire sessions after 10 minutes

**Detailed View Must Include:**

* Full scheme name (bold)
* Full benefit explanation
* Complete eligibility details
* Full document list
* Step-by-step application process
* Offline option (Visit CSC / Gram Panchayat)

**Acceptance:**

* User sends: "farming schemes"
* Bot shows 3 schemes
* User sends: "1"
* Bot shows detailed explanation
* User sends: "back"
* Bot shows previous list

**Requirements:** Phase 2 Enhancement

---

### Task 12: ngrok End-to-End Testing Before Deployment

**Time:** 45 minutes
**Dependencies:** Task 8 completed

**Purpose:**
Test full WhatsApp → Twilio → Local Webhook flow before Vercel deployment.

**Steps:**

1. Start local server:

   ```bash
   npm run dev
   ```
2. Start ngrok tunnel:

   ```bash
   ngrok http 3000
   ```
3. Copy generated HTTPS URL
4. Update Twilio Sandbox webhook to:

   ```
   https://your-ngrok-url/api/webhook
   ```
5. Send test messages from phone

**Test Cases:**

* "farming schemes" ✅
* "health age 65" ✅
* "housing income 20000" ✅
* "खेती योजना" ✅
* "xyz123" ✅
* Numeric reply "1" ✅

**Acceptance:**

* Response received in real WhatsApp
* Eligibility filtering works
* Hindi detection works
* Detailed view works
* No TwiML/XML errors

**Requirements:** Deployment Readiness

---

### Task 13: Add 20 More Schemes (Already done(skip))

**Time:** 2–3 hours
**Dependencies:** Task 3

**File:** `public/schemes.json`

**Instructions:**
Expand scheme database to minimum 30 schemes total.

**Category Targets:**

* Agriculture: 6 total
* Health: 5 total
* Housing: 4 total
* Education: 4 total
* Women: 5 total
* Employment: 3 total
* Senior Citizens: 3 total

**For EACH scheme include:**

* English + Hindi keywords
* Specific eligibility (minAge, maxAge, incomeLimit)
* Real government URLs
* Required documents

**Acceptance:**

* Minimum 30 schemes
* Strong keyword coverage
* Proper eligibility filtering works

**Requirements:** R1 Expansion

---

### Task 14: Deploy to Vercel

**Time:** 30 minutes
**Dependencies:** Task 12 passed

**Steps:**

1. Push code to GitHub
2. Import project to Vercel
3. Deploy
4. Get production URL
5. Update Twilio webhook to:

   ```
   https://your-app.vercel.app/api/webhook
   ```

**Acceptance:**

* Production URL working
* WhatsApp messages reach deployed webhook
* No environment variable errors

**Requirements:** Production Deployment

---

### Task 15: Create Demo Video

**Time:** 1 hour
**Dependencies:** Task 14 completed

**Record:**

1. WhatsApp conversation demo
2. Hindi test
3. Detailed view test
4. Landing page walkthrough

**Acceptance:**

* 60–90 second demo ready
* Backup in case live demo fails

---

### Task 16: Create Presentation Slides

**Time:** 2 hours

**5 slides only:**

1. Problem (₹1.84L Cr unclaimed)
2. Solution (WhatsApp AI Bot)
3. Live Demo
4. Impact & Scale
5. Differentiation & Future Scope

**Acceptance:**

* Clear visuals
* No long paragraphs
* Strong impact narrative

---

### Task 17: Practice Pitch

**Time:** 1 hour

Practice:

* 5-minute pitch
* 3-minute version
* 1-minute version

---

## FINAL CHECKLIST

**Before demo:**

* [ ] 30+ schemes indexed
* [ ] Multi-turn conversation working
* [ ] ngrok tested successfully
* [ ] Vercel deployed
* [ ] WhatsApp working live
* [ ] Demo video recorded
* [ ] Slides ready
* [ ] Pitch practiced

---

## TIME ALLOCATION

**Phase 1 (Core MVP):** 10–12 hours
**Phase 2 (Enhancements + Deployment):** 6–8 hours
**Phase 3 (Presentation):** 3–4 hours
**Buffer:** 2 hours

**Total:** 22–24 hours
