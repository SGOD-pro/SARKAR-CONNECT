# SarkarConnect

WhatsApp-based government scheme discovery for rural India. Built for 24-hour hackathon.

## 🎯 Problem

- **₹1.84 lakh crore** in unclaimed welfare funds in India
- 40% of eligible farmers don't know about PM-KISAN
- Information trapped in English PDFs on government websites
- Middlemen charge ₹500 for free schemes

## 💡 Solution

WhatsApp bot that:
- Works on basic phones (₹1,500 JioPhones)
- Responds in Hindi/English
- Filters by eligibility (age, income)
- Provides direct application links

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

### 3. Run Development Server

```bash
npm run dev
```

Server runs on [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Local Testing (Without Twilio)

Run the test script:

```bash
node test-webhook.js
```

Or use curl/Postman:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -d "Body=farming schemes" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Testing with Twilio Sandbox

1. **Install ngrok**:
   ```bash
   ngrok http 3000
   ```

2. **Configure Twilio**:
   - Go to Twilio Console → Messaging → Try it out → WhatsApp Sandbox
   - Set webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`
   - Save

3. **Test on WhatsApp**:
   - Send `join <sandbox-code>` to Twilio WhatsApp number
   - Send: `farming schemes`
   - You should receive scheme recommendations!

## 📱 Example Queries

| Query | Response |
|-------|----------|
| `farming schemes` | PM-KISAN, Fasal Bima, etc. |
| `health age 65` | Ayushman Bharat, NSAP (filtered by age) |
| `खेती योजना` | Hindi response with schemes |
| `housing income 50000` | PMAY (filtered by income) |

## 🏗️ Architecture

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
User sees formatted schemes
```

## 📂 Project Structure

```
├── public/
│   └── schemes.json          # 10 government schemes (expand to 30)
├── src/
│   ├── app/
│   │   └── api/
│   │       └── webhook/
│   │           └── route.ts  # Twilio webhook handler
│   ├── lib/
│   │   ├── extractor.ts      # Extract age/income from messages
│   │   ├── matcher.ts        # Keyword matching + eligibility filter
│   │   ├── language.ts       # Detect Hindi/English
│   │   └── formatter.ts      # Format response for WhatsApp
│   └── types/
│       └── scheme.ts         # TypeScript interfaces
└── test-webhook.js           # Local testing script
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Messaging**: Twilio WhatsApp API
- **Database**: JSON file (no DB needed for 30 schemes)
- **Deployment**: Vercel (recommended)

## 📊 Current Status

✅ Core MVP Complete:
- [x] Scheme database (10 schemes, expand to 30)
- [x] Entity extraction (age, income)
- [x] Keyword matching
- [x] Eligibility filtering
- [x] Language detection (Hindi/English)
- [x] Response formatting
- [x] Twilio webhook handler

🚧 Next Steps:
- [ ] Add 20 more schemes to reach 30
- [ ] Build landing page
- [ ] Deploy to Vercel
- [ ] Create demo video
- [ ] Prepare presentation

## 🎨 Adding More Schemes

Edit `public/schemes.json`:

```json
{
  "id": "scheme-id",
  "name": "Scheme Name",
  "nameHindi": "योजना का नाम",
  "category": "agriculture|health|housing|education|women|employment|senior",
  "benefits": "What user gets",
  "eligibility": {
    "minAge": 18,
    "maxAge": 60,
    "occupation": ["farmer"],
    "incomeLimit": 100000,
    "states": "all"
  },
  "documents": ["Aadhaar", "Bank account"],
  "applicationProcess": "How to apply + URL",
  "keywords": ["english", "hindi", "हिंदी", "slang"]
}
```

**Critical**: Add extensive keywords in both English and Hindi!

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Update Twilio webhook to production URL
# https://your-app.vercel.app/api/webhook
```

## 🐛 Troubleshooting

**Webhook not receiving messages?**
- Check ngrok URL is correct
- Verify Twilio webhook configuration
- Check console logs for errors

**No schemes matching?**
- Add more keywords to schemes.json
- Check case sensitivity (should be case-insensitive)
- Verify query contains valid keywords

**Hindi not working?**
- Check language detection regex
- Verify scheme nameHindi fields are populated

## 📝 License

MIT
