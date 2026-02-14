# Deployment Guide - SarkarConnect

## 🚀 Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SarkarConnect WhatsApp bot"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sarkarconnect.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Add Environment Variables**
   - In Vercel dashboard, go to: Settings → Environment Variables
   - Add:
     - `TWILIO_ACCOUNT_SID` = your_account_sid
     - `TWILIO_AUTH_TOKEN` = your_auth_token
   - Redeploy the project

4. **Update Twilio Webhook**
   - Copy your Vercel URL: `https://your-app.vercel.app`
   - Go to Twilio Console → Messaging → WhatsApp Sandbox
   - Set webhook to: `https://your-app.vercel.app/api/webhook`
   - Save

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? sarkarconnect
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN

# Deploy to production
vercel --prod
```

---

## 🌐 Alternative: Deploy to Railway

Railway is another great option for Next.js apps.

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set TWILIO_ACCOUNT_SID=your_sid
   railway variables set TWILIO_AUTH_TOKEN=your_token
   ```

4. **Get URL and Update Twilio**
   ```bash
   railway domain
   ```
   Use the domain to update Twilio webhook.

---

## 🐳 Deploy with Docker (Advanced)

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

```bash
# Build image
docker build -t sarkarconnect .

# Run container
docker run -p 3000:3000 \
  -e TWILIO_ACCOUNT_SID=your_sid \
  -e TWILIO_AUTH_TOKEN=your_token \
  sarkarconnect
```

---

## 🔧 Post-Deployment Checklist

### 1. Test the Webhook

```bash
curl -X POST https://your-app.vercel.app/api/webhook \
  -d "Body=farming schemes" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

Expected: TwiML XML response with scheme details

### 2. Test on WhatsApp

1. Send join code to Twilio WhatsApp number
2. Send: `farming schemes`
3. Should receive scheme recommendations

### 3. Verify Landing Page

Visit: `https://your-app.vercel.app`

Should show:
- Hero section with statistics
- How it works
- 31 schemes displayed
- Setup instructions

### 4. Monitor Logs

**Vercel:**
- Dashboard → Your Project → Deployments → View Function Logs

**Railway:**
```bash
railway logs
```

---

## 🐛 Troubleshooting

### Issue: Webhook returns 500 error

**Solution:**
- Check environment variables are set correctly
- View deployment logs for error details
- Verify schemes.json is valid JSON

### Issue: WhatsApp not receiving responses

**Solution:**
- Verify Twilio webhook URL is correct
- Check webhook URL ends with `/api/webhook`
- Ensure URL is HTTPS (not HTTP)
- Test webhook directly with curl

### Issue: Schemes not loading

**Solution:**
- Verify `public/schemes.json` is deployed
- Check file is valid JSON: `node count-schemes.js`
- Review build logs for errors

### Issue: Hindi responses not working

**Solution:**
- Verify UTF-8 encoding in schemes.json
- Check language detection regex in `src/lib/language.ts`
- Test with: `खेती योजना`

---

## 📊 Monitoring & Analytics

### Add Vercel Analytics

```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Monitor Webhook Performance

Add logging in `src/app/api/webhook/route.ts`:
```typescript
console.log({
  timestamp: new Date().toISOString(),
  query: body,
  matchCount: schemes.length,
  language,
  age,
  income
});
```

---

## 🔒 Security Best Practices

### 1. Enable Twilio Webhook Signature Verification

In `src/app/api/webhook/route.ts`:
```typescript
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-twilio-signature');
  const url = req.url;
  const formData = await req.formData();
  
  const params = Object.fromEntries(formData);
  
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature!,
    url,
    params
  );
  
  if (!isValid) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // ... rest of code
}
```

### 2. Rate Limiting (Optional)

Use Vercel Edge Config or Upstash Redis for rate limiting.

### 3. Environment Variables

Never commit `.env` file to Git!

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 📈 Scaling Considerations

### Current Setup (Good for MVP)
- ✅ Handles 100+ requests/second
- ✅ 31 schemes in JSON (fast)
- ✅ Stateless (scales horizontally)

### If You Need to Scale (1000+ users/day)

1. **Add Database**
   - Use PostgreSQL or MongoDB
   - Index keywords for faster search
   - Cache frequently accessed schemes

2. **Add Redis Cache**
   - Cache scheme data
   - Cache common queries
   - Reduce database load

3. **Use CDN**
   - Serve landing page via CDN
   - Cache static assets
   - Reduce server load

4. **Add Search Engine**
   - Use Elasticsearch for better matching
   - Support fuzzy search
   - Handle typos

---

## 🎯 Production Checklist

Before going live:

- [ ] Environment variables set in production
- [ ] Twilio webhook updated to production URL
- [ ] Landing page accessible
- [ ] Webhook tested with curl
- [ ] WhatsApp tested with real messages
- [ ] All 31 schemes displaying correctly
- [ ] Hindi responses working
- [ ] Error handling tested
- [ ] Logs monitored
- [ ] Domain configured (optional)
- [ ] Analytics enabled (optional)
- [ ] Backup/monitoring set up

---

## 🌟 Custom Domain (Optional)

### Vercel

1. Go to: Project Settings → Domains
2. Add your domain: `sarkarconnect.com`
3. Update DNS records as instructed
4. Update Twilio webhook to new domain

### Railway

```bash
railway domain add sarkarconnect.com
```

Follow DNS instructions.

---

## 📞 Support

If you encounter issues:

1. Check deployment logs
2. Test webhook with curl
3. Verify environment variables
4. Review Twilio console for errors
5. Check GitHub issues (if open source)

---

## 🎉 You're Live!

Once deployed:
- Share your WhatsApp bot with users
- Monitor usage and feedback
- Iterate based on user needs
- Add more schemes as needed

**Production URL:** `https://your-app.vercel.app`
**WhatsApp Webhook:** `https://your-app.vercel.app/api/webhook`

Good luck! 🚀
