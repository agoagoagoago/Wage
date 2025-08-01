import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | SingaporeWage.com',
  description: 'Terms of service for SingaporeWage.com - Singapore\'s trusted salary lookup platform. Understanding the terms and conditions of use.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing and using SingaporeWage.com salary lookup service, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Use License</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for commercial purposes or public display</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Accuracy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The wage data provided is sourced from Singapore Manpower Ministry Occupational Wages 2024. While we strive for accuracy, wage statistics may vary by location, experience, company size, and other factors. This information is provided for informational purposes only and should not be considered as professional advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Disclaimer</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The materials on this website are provided on an 'as is' basis. SingaporeWage.com makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitations</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In no event shall SingaporeWage.com or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms of Service, please contact us at terms@singaporewage.com
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