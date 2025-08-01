import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | SingaporeWage.com',
  description: 'Privacy policy for SingaporeWage.com - Singapore\'s trusted salary lookup platform. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect information you provide directly to us, such as when you use our wage lookup service, contact us, or interact with our website.
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Search queries and occupation lookups</li>
              <li>Device information and browser type</li>
              <li>IP address and general location data</li>
              <li>Usage patterns and site interaction data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide and improve our wage lookup service</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Display relevant advertisements through Google AdSense</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Google AdSense and Analytics</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use Google AdSense to display advertisements and Google Analytics to understand how our service is used. These services may collect information about your visits to this and other websites in order to provide relevant advertisements and analytics.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can opt out of personalized advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" className="text-blue-600 dark:text-blue-400 hover:underline">
                Google's Ads Settings
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at privacy@singaporewage.com
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to SingaporeWage.com
          </a>
        </div>
      </div>
    </div>
  )
}