import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About SingaporeWage.com | Singapore\'s #1 Salary Lookup Tool',
  description: 'Learn about SingaporeWage.com - Singapore\'s most trusted salary lookup platform. Find official wage information for 569+ occupations from MOM data.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About SingaporeWage.com
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Singapore's #1 Salary Lookup Platform - Trusted by Thousands
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              SingaporeWage.com was created to democratize access to Singapore's salary information. We provide 100% free, accurate wage data to help job seekers negotiate better salaries, employees understand their market value, and employers benchmark competitive compensation packages. Our platform offers median gross wage data for over 569 occupations based on official Singapore Manpower Ministry statistics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Source</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our wage data is sourced directly from the Singapore Manpower Ministry Occupational Wages 2024 report. This ensures that the information you receive is:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Official:</strong> Based on government-collected data</li>
              <li><strong>Comprehensive:</strong> Covers 569+ different occupations</li>
              <li><strong>Current:</strong> Updated with 2024 wage statistics</li>
              <li><strong>Reliable:</strong> Collected through systematic surveys</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How to Use</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Using our wage lookup tool is simple:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Type an occupation title in the search box</li>
              <li>Select from the suggested occupations that appear</li>
              <li>View the median gross wage for that occupation</li>
              <li>Use this information to guide your salary expectations</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Important Notes</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Please remember:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Wages may vary significantly based on experience, qualifications, company size, and industry</li>
                <li>These figures represent median values, meaning half earn more and half earn less</li>
                <li>Location within Singapore can also affect salary levels</li>
                <li>This data should be used as a general guide, not as definitive salary expectations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Popular Searches</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Some of the most commonly searched occupations include:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">Software Engineer</div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">Registered Nurse</div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">Data Scientist</div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">Marketing Manager</div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">Accountant</div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">Teacher</div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact SingaporeWage.com</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions, suggestions, or need help with salary research? We'd love to hear from you!
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>General Inquiries:</strong> contact@singaporewage.com</li>
              <li><strong>Data Updates:</strong> data@singaporewage.com</li>
              <li><strong>Technical Support:</strong> support@singaporewage.com</li>
              <li><strong>Business Partnerships:</strong> partnerships@singaporewage.com</li>
            </ul>
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