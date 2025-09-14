import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>FraudShield SEBI - Protect Your Investments</title>
        <meta name="description" content="Verify SEBI registered advisors and analyze investment tips for fraud detection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">FraudShield SEBI</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Protect Your Investments with
              <span className="text-primary-600"> FraudShield</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Verify SEBI registered advisors and analyze investment tips to detect potential fraud. 
              Make informed investment decisions with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/verify" className="w-full sm:w-auto">
                <button className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                  🔍 Verify Advisor
                </button>
              </Link>
              <Link href="/verify" className="w-full sm:w-auto">
                <button className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                  📊 Analyze Tip
                </button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">SEBI Verification</h3>
              <p className="text-gray-600">
                Verify if your financial advisor is registered with SEBI and check their credentials.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Tip Analysis</h3>
              <p className="text-gray-600">
                Analyze investment tips and recommendations for potential red flags and fraud indicators.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Risk Assessment</h3>
              <p className="text-gray-600">
                Get detailed risk assessments with confidence scores and evidence-based recommendations.
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Enter Information</h3>
                <p className="text-gray-600">
                  Enter advisor name, paste tip text, or provide a link to analyze.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Our system analyzes the information using advanced fraud detection algorithms.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Results</h3>
                <p className="text-gray-600">
                  Receive a detailed verdict with risk level, reasons, and recommendations.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-4">FraudShield SEBI</h3>
            <p className="text-gray-400 mb-4">
              Protecting investors through advanced fraud detection and SEBI compliance verification.
            </p>
            <p className="text-sm text-gray-500">
              © 2024 FraudShield SEBI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
