import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'SingaporeWage.com | Official Singapore Salary & Wage Data 2024',
  description: 'Find official Singapore wage data for 569+ occupations. Get median gross salary information from Singapore Manpower Ministry. Free salary lookup at SingaporeWage.com',
  keywords: 'Singapore wage, Singapore salary, SingaporeWage, median wage Singapore, gross wage Singapore, occupation salary Singapore, Singapore jobs salary, salary data Singapore, wage statistics Singapore, job salary Singapore, Singapore manpower ministry wage data',
  authors: [{ name: 'SingaporeWage.com' }],
  creator: 'SingaporeWage.com',
  publisher: 'SingaporeWage.com',
  metadataBase: new URL('https://singaporewage.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_SG',
    url: 'https://singaporewage.com',
    title: 'SingaporeWage.com | Official Singapore Salary & Wage Data 2024',
    description: 'Find official Singapore wage data for 569+ occupations. Get median gross salary information from Singapore Manpower Ministry data.',
    siteName: 'SingaporeWage.com',
    images: [
      {
        url: 'https://singaporewage.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SingaporeWage.com - Singapore Salary Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SingaporeWage',
    title: 'SingaporeWage.com | Official Singapore Salary & Wage Data 2024',
    description: 'Find official Singapore wage data for 569+ occupations. Free salary lookup tool.',
    images: ['https://singaporewage.com/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* AdSense Script */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>

        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SingaporeWage.com - Singapore Wage & Salary Lookup",
              "description": "Find official Singapore wage data for 569+ occupations. Get median gross salary information from Singapore Manpower Ministry data. Free salary lookup tool.",
              "url": "https://singaporewage.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "author": {
                "@type": "Organization",
                "name": "SingaporeWage.com",
                "url": "https://singaporewage.com"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SGD"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://singaporewage.com/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "audience": {
                "@type": "Audience",
                "geographicArea": {
                  "@type": "Country",
                  "name": "Singapore"
                }
              }
            })
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}