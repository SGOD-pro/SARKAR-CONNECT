# Testing Guide - SarkarConnect

## 🧪 Testing Strategy

This guide covers all testing approaches for the WhatsApp schemes matcher.

---

## 1. Local Testing (No Twilio Required)

### A. Test with Node Script

```bash
# Make sure dev server is running
npm run dev

# In another terminal, run:
node test-local.js
```

This will test 10 different queries and show responses.

### B. Test with curl (Windows PowerShell)

```powershell
# Test farming query
Invoke-WebRequest -Uri "http://localhost:3000/api/webhook" `
  -Method POST `
  -Body "Body=farming schemes" `
  -ContentType "application/x-www-form-urlencoded"

# Test with age filter
Invoke-WebRequest -Uri "http://localhost:3000/api/webhook" `
  -Method POST `
  -Body "Body=health age 65" `
  -ContentType "application/x-www-form-urlencoded"

# Test Hindi query
Invoke-WebRequest -Uri "http://localhost:3000/api/webhook" `
  -Method POST `
  -Body "Body=खेती योजना" `
  -ContentType "application/x-www-form-urlencoded"
```

### C. Test with Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:3000/api/webhook`
4. Headers: `Content-Type: application/x-www-form-urlencoded`
5. Body (x-www-form-urlencoded):
   - Key: `Body`
   - Value: `farming schemes`
6. Send

---

## 2. Component Testing

### Test Entity Extractor

Create `test-extractor.js`:
```javascript
const { extractEntities } = require('./src/lib/extractor.ts');

const tests = [
  { input: "age 35", expected: { age: 35 } },
  { input: "income 15000", expected: { income: 15000 } },
  { input: "I am 45 earning ₹20000", expected: { age: 45, income: 20000 } },
  { input: "farming schemes", expected: {} },
];

tests.forEach(test => {
  const result = extractEntities(test.input);
  console.log(`Input: "${test.input}"`);
  console.log(`Expected:`, test.expected);
  console.log(`Got:`, result);
  console.log(`✅ Pass:`, JSON.stringify(result) === JSON.stringify(test.expected));
  console.log('---');
});
```

Run: `node test-extractor.js`

### Test Matcher

Create `test-matcher.js`:
```javascript
const { matchSchemes } = require('./src/lib/matcher.ts');

const tests = [
  { query: "farming schemes", expectedCount: 3 },
  { query: "health age 65", age: 65, expectedCategory: "health" },
  { query: "xyz123", expectedCount: 0 },
];

tests.forEach(test => {
  const result = matchSchemes(test.query, test.age, test.income);
  console.log(`Query: "${test.query}"`);
  console.log(`Matches: ${result.length}`);
  result.forEach(s => console.log(`  - ${s.name}`));
  console.log('---');
});
```

Run: `node test-matcher.js`

---

## 3. Integration Testing with Twilio Sandbox

### Setup

1. **Install ngrok**
   ```bash
   # Download from https://ngrok.com/download
   # Or use chocolatey:
   choco install ngrok
   ```

2. **Start dev server**
   ```bash
   npm run dev
   ```

3. **Start ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Configure Twilio**
   - Go to: https://console.twilio.com
   - Navigate to: Messaging → Try it out → WhatsApp Sandbox
   - Copy ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Set webhook: `https://abc123.ngrok.io/api/webhook`
   - Save

5. **Join Sandbox**
   - Send join code to Twilio WhatsApp number
   - Example: `join happy-tiger-123`

### Test Cases

| Test Case | Query | Expected Result |
|-----------|-------|----------------|
| **Basic Matching** | `farming schemes` | PM-KISAN, Fasal Bima, KCC |
| **Age Filter** | `health age 65` | Ayushman Bharat, NSAP (age-filtered) |
| **Income Filter** | `housing income 50000` | PMAY schemes (income-filtered) |
| **Hindi Query** | `खेती योजना` | Hindi response with farming schemes |
| **Women Schemes** | `women schemes` | Ujjwala, Lakhpati Didi, NRLM |
| **Employment** | `job schemes` | MGNREGA, e-Shram, MUDRA |
| **Education** | `scholarship` | Post-Matric Scholarship, DDU-GKY |
| **Senior Citizens** | `pension` | NSAP, PMVVY |
| **Insurance** | `insurance age 25` | PMJJBY, PMSBY (age-filtered) |
| **No Match** | `xyz123` | "Sorry, no schemes found..." |
| **Combined Filter** | `farming age 20 income 30000` | Schemes matching all criteria |

### Expected Response Format

```
Found 3 scheme(s) for you:

1️⃣ *PM-Kisan Samman Nidhi*
💰 ₹6,000 per year in 3 installments of ₹2,000 each
✅ Age: 18+, farmer
📄 Aadhaar card, Bank account details
🔗 Visit nearest Common Service Center or apply online at pmkisan.gov.in

2️⃣ *Pradhan Mantri Fasal Bima Yojana*
💰 Crop insurance against natural calamities, pests, and diseases
✅ Age: 18+, farmer
📄 Aadhaar card, Land records
🔗 Apply through bank, CSC, or online at pmfby.gov.in

3️⃣ *Kisan Credit Card (KCC)*
💰 Low-interest credit up to ₹3 lakh for farming needs at 4% interest.
✅ Age: 18+, farmer
📄 Land records, Aadhaar
🔗 Apply at any bank branch or through PM-Kisan portal.

Reply with number for more details (1, 2, 3)
```

---

## 4. Edge Case Testing

### Test Invalid Inputs

| Input | Expected Behavior |
|-------|------------------|
| Empty message | "Sorry, I didn't receive your message..." |
| Very long message (1000+ chars) | Should handle gracefully |
| Special characters: `!@#$%^&*()` | Should not crash |
| Numbers only: `123456` | Should extract if age/income pattern |
| Emojis: `🌾🚜` | Should not crash |
| Mixed language: `farming योजना` | Should detect Hindi, match keywords |

### Test Eligibility Edge Cases

| Query | Age | Income | Expected |
|-------|-----|--------|----------|
| `health` | 17 | - | Filter out schemes with minAge: 18 |
| `insurance` | 51 | - | Filter out PMJJBY (maxAge: 50) |
| `housing` | - | 700000 | Filter out schemes with incomeLimit < 700000 |
| `farming` | 16 | - | Filter out schemes with minAge: 18 |

---

## 5. Performance Testing

### Response Time Test

Create `test-performance.js`:
```javascript
async function testPerformance() {
  const queries = [
    "farming schemes",
    "health age 65",
    "खेती योजना",
    "housing income 50000",
  ];
  
  for (const query of queries) {
    const start = Date.now();
    
    await fetch("http://localhost:3000/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `Body=${encodeURIComponent(query)}`,
    });
    
    const duration = Date.now() - start;
    console.log(`Query: "${query}" - ${duration}ms`);
  }
}

testPerformance();
```

**Target:** < 200ms per request

### Load Test (Optional)

Use Apache Bench or Artillery:
```bash
# Install artillery
npm install -g artillery

# Create artillery.yml
artillery quick --count 100 --num 10 http://localhost:3000/api/webhook
```

---

## 6. Manual Testing Checklist

### Before Demo

- [ ] Dev server running (`npm run dev`)
- [ ] Landing page loads (http://localhost:3000)
- [ ] All 31 schemes displayed on landing page
- [ ] Webhook responds to curl test
- [ ] ngrok tunnel active
- [ ] Twilio webhook configured
- [ ] WhatsApp sandbox joined
- [ ] Test 5+ different queries on WhatsApp
- [ ] Hindi responses working
- [ ] Age filtering working
- [ ] Income filtering working
- [ ] No crashes on invalid input
- [ ] Error messages user-friendly

### Test Scenarios

1. **Happy Path**
   - Send: `farming schemes`
   - Verify: Receive 3 farming schemes
   - Verify: Emojis display correctly
   - Verify: Links are clickable

2. **Eligibility Filtering**
   - Send: `health age 65`
   - Verify: Only schemes for 65+ age
   - Verify: PMJJBY (maxAge: 50) NOT included

3. **Language Detection**
   - Send: `खेती योजना`
   - Verify: Response in Hindi
   - Verify: Scheme names in Hindi

4. **No Matches**
   - Send: `xyz123`
   - Verify: Helpful error message
   - Verify: Suggestions provided

5. **Combined Filters**
   - Send: `housing age 30 income 50000`
   - Verify: Only eligible schemes returned

---

## 7. Regression Testing

After making changes, re-run:

```bash
# 1. Verify JSON is valid
node count-schemes.js

# 2. Check TypeScript compilation
npm run build

# 3. Test webhook locally
node test-local.js

# 4. Test on WhatsApp
# Send 5 test queries
```

---

## 8. User Acceptance Testing (UAT)

### Test with Real Users

1. **Recruit 5-10 testers**
   - Mix of Hindi and English speakers
   - Different age groups
   - Rural and urban users

2. **Give them scenarios**
   - "Find schemes for farmers"
   - "Find health insurance for seniors"
   - "Find education scholarships"

3. **Collect feedback**
   - Was response helpful?
   - Were schemes relevant?
   - Was language appropriate?
   - Any confusion?

4. **Iterate based on feedback**
   - Add missing keywords
   - Improve response formatting
   - Add more schemes if needed

---

## 9. Monitoring in Production

### Add Logging

In `src/app/api/webhook/route.ts`:
```typescript
console.log({
  timestamp: new Date().toISOString(),
  query: body,
  language,
  age,
  income,
  matchCount: schemes.length,
  schemeIds: schemes.map(s => s.id),
});
```

### Monitor Metrics

- Response time
- Error rate
- Most common queries
- Language distribution
- Schemes with most matches

---

## 10. Troubleshooting Guide

### Issue: Webhook not responding

**Debug steps:**
1. Check dev server is running: `curl http://localhost:3000`
2. Check ngrok is running: `ngrok http 3000`
3. Verify Twilio webhook URL matches ngrok URL
4. Check console logs for errors

### Issue: Wrong schemes returned

**Debug steps:**
1. Test matcher directly: `node test-matcher.js`
2. Check keywords in `public/schemes.json`
3. Verify eligibility logic in `src/lib/matcher.ts`
4. Add more keywords if needed

### Issue: Hindi not working

**Debug steps:**
1. Test language detection: `node test-language.js`
2. Verify UTF-8 encoding in schemes.json
3. Check Devanagari regex in `src/lib/language.ts`
4. Test with: `खेती योजना`

---

## ✅ Testing Complete!

Once all tests pass:
- Document any issues found
- Fix critical bugs
- Deploy to production
- Monitor real usage
- Iterate based on feedback

**Remember:** Testing is ongoing! Keep monitoring and improving based on user feedback.
