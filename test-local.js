// Enhanced local testing script for the webhook
const testCases = [
  { body: "farming schemes", description: "Simple farming query" },
  { body: "health age 65", description: "Health query with age filter" },
  { body: "खेती योजना", description: "Hindi farming query" },
  { body: "housing income 50000", description: "Housing with income filter" },
  { body: "women schemes", description: "Women empowerment schemes" },
  { body: "pension", description: "Senior citizen pension" },
  { body: "education scholarship", description: "Education schemes" },
  { body: "business loan", description: "Employment/business schemes" },
  { body: "xyz123", description: "No matches test" },
  { body: "insurance age 25", description: "Insurance with age" },
];

async function testWebhook() {
  console.log("🧪 Testing WhatsApp Webhook Locally\n");
  console.log("=" .repeat(60));
  
  for (const testCase of testCases) {
    console.log(`\n📱 Test: ${testCase.description}`);
    console.log(`Query: "${testCase.body}"`);
    console.log("-".repeat(60));
    
    try {
      const response = await fetch("http://localhost:3000/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `Body=${encodeURIComponent(testCase.body)}`,
      });
      
      const text = await response.text();
      
      // Parse TwiML to extract message
      const messageMatch = text.match(/<Message>([\s\S]*?)<\/Message>/);
      if (messageMatch) {
        console.log(`✅ Response:\n${messageMatch[1]}\n`);
      } else {
        console.log(`⚠️  Raw TwiML:\n${text}\n`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log("=" .repeat(60));
  console.log("\n✅ Testing complete! Make sure dev server is running: npm run dev\n");
}

// Check if server is running
fetch("http://localhost:3000")
  .then(() => {
    console.log("✅ Dev server is running!\n");
    testWebhook();
  })
  .catch(() => {
    console.error("❌ Dev server is not running!");
    console.error("Please start it with: npm run dev\n");
    process.exit(1);
  });
