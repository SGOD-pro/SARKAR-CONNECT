import schemesData from '../../public/schemes.json';

export default function Home() {
  const schemes = schemesData.schemes;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Find Government Schemes
            <br />
            <span className="text-green-600">In Your Language</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            ₹1.84 lakh crore in welfare funds goes unclaimed every year. 
            We&apos;re changing that with WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#how-it-works" 
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-green-700 transition"
            >
              Learn How It Works
            </a>
            <a 
              href="#schemes" 
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-50 transition border-2 border-green-600"
            >
              Browse Schemes
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">₹1.84L Cr</div>
              <div className="text-gray-600">Unclaimed welfare funds in India</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">40%</div>
              <div className="text-gray-600">Eligible farmers don&apos;t know about PM-KISAN</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">535M</div>
              <div className="text-gray-600">WhatsApp users in India</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">1. Send Message</h3>
              <p className="text-gray-600">
                Send a WhatsApp message like &quot;farming schemes&quot; or &quot;खेती योजना&quot;
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">2. AI Matches</h3>
              <p className="text-gray-600">
                Our bot finds relevant schemes based on your query and eligibility
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">3. Get Results</h3>
              <p className="text-gray-600">
                Receive top 3 schemes with benefits, eligibility, and application links
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Try These Queries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="font-mono text-green-600 mb-2">farming schemes</div>
              <div className="text-sm text-gray-600">Get PM-KISAN, Fasal Bima, and more</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="font-mono text-green-600 mb-2">health age 65</div>
              <div className="text-sm text-gray-600">Schemes filtered by your age</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="font-mono text-green-600 mb-2">खेती योजना</div>
              <div className="text-sm text-gray-600">Get response in Hindi</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="font-mono text-green-600 mb-2">housing income 50000</div>
              <div className="text-sm text-gray-600">Schemes you qualify for</div>
            </div>
          </div>
        </div>
      </section>

      {/* Schemes Browser */}
      <section id="schemes" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Available Schemes ({schemes.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{scheme.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {scheme.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scheme.nameHindi}</p>
                <p className="text-gray-700 mb-3">💰 {scheme.benefits}</p>
                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    ✅ {scheme.eligibility.minAge && `Age: ${scheme.eligibility.minAge}+`}
                    {scheme.eligibility.occupation && ` • ${scheme.eligibility.occupation[0]}`}
                  </div>
                  <div className="mb-1">
                    📄 {scheme.documents.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Instructions */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Setup Instructions</h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">For Developers</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Clone the repository and install dependencies: <code className="bg-gray-200 px-2 py-1 rounded">npm install</code></li>
              <li>Set up Twilio WhatsApp sandbox at console.twilio.com</li>
              <li>Install ngrok: <code className="bg-gray-200 px-2 py-1 rounded">ngrok http 3000</code></li>
              <li>Configure Twilio webhook to your ngrok URL: <code className="bg-gray-200 px-2 py-1 rounded">https://your-url.ngrok.io/api/webhook</code></li>
              <li>Send WhatsApp message to test!</li>
            </ol>
            <div className="mt-6">
              <a 
                href="https://github.com" 
                className="text-green-600 hover:underline font-semibold"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white text-center">
        <p className="mb-2">Built for AI for Bharat Hackathon 2024</p>
        <p className="text-sm text-gray-400">
          Empowering rural India through accessible technology
        </p>
      </footer>
    </main>
  );
}
