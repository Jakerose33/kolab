import React from 'react';

import { SEOOptimizer } from '@/components/SEOOptimizer';

export default function CookiePolicy() {
  return (
    <>
      <SEOOptimizer
        page="profile"
        title="Cookie Policy | Kolab - Underground Culture Platform"
        description="Learn how Kolab uses cookies to enhance your experience on our underground culture platform. Manage your cookie preferences."
        keywords={["cookie policy", "cookies", "data privacy", "website tracking", "GDPR compliance"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Cookie Policy', url: '/cookies' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              analyzing how you use our platform, and improving our services.
            </p>
            <p>
              This Cookie Policy explains how Kolab ("we," "our," or "us") uses cookies and similar 
              technologies on our underground culture platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the website to function properly and cannot be disabled. They include:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Authentication cookies to keep you logged in</li>
              <li>Security cookies to protect against fraud</li>
              <li>Session cookies to maintain your preferences during your visit</li>
              <li>Load balancing cookies to ensure optimal performance</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Performance Cookies</h3>
            <p className="mb-4">
              These cookies help us understand how visitors interact with our website:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Google Analytics cookies to measure website usage</li>
              <li>Performance monitoring cookies to identify technical issues</li>
              <li>Error tracking cookies to improve platform stability</li>
              <li>Speed testing cookies to optimize loading times</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Functional Cookies</h3>
            <p className="mb-4">
              These cookies enhance your experience by remembering your choices:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Language and region preferences</li>
              <li>Theme preferences (dark/light mode)</li>
              <li>Event filters and search preferences</li>
              <li>Notification settings</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Marketing Cookies</h3>
            <p className="mb-4">
              These cookies help us show you relevant content and measure campaign effectiveness:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Social media integration cookies</li>
              <li>Event recommendation cookies</li>
              <li>Email campaign tracking cookies</li>
              <li>Advertising effectiveness cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="mb-4">
              We use third-party services that may set their own cookies:
            </p>
            
            <div className="bg-muted p-6 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Google Analytics</h4>
              <p className="text-sm mb-2">
                <strong>Purpose:</strong> Website analytics and user behavior tracking
              </p>
              <p className="text-sm mb-2">
                <strong>Duration:</strong> Up to 2 years
              </p>
              <p className="text-sm">
                <strong>More info:</strong> <a href="https://policies.google.com/privacy" className="text-primary hover:underline">Google Privacy Policy</a>
              </p>
            </div>

            <div className="bg-muted p-6 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Stripe</h4>
              <p className="text-sm mb-2">
                <strong>Purpose:</strong> Payment processing and fraud prevention
              </p>
              <p className="text-sm mb-2">
                <strong>Duration:</strong> Session-based
              </p>
              <p className="text-sm">
                <strong>More info:</strong> <a href="https://stripe.com/privacy" className="text-primary hover:underline">Stripe Privacy Policy</a>
              </p>
            </div>

            <div className="bg-muted p-6 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Social Media Platforms</h4>
              <p className="text-sm mb-2">
                <strong>Purpose:</strong> Social sharing and login functionality
              </p>
              <p className="text-sm mb-2">
                <strong>Duration:</strong> Varies by platform
              </p>
              <p className="text-sm">
                <strong>Platforms:</strong> Facebook, Instagram, Twitter, LinkedIn
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-medium mb-3">Browser Settings</h3>
            <p className="mb-4">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>View and delete cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when you close the browser</li>
              <li>Set up automatic cookie deletion</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Our Cookie Consent Tool</h3>
            <p className="mb-4">
              When you first visit our website, you'll see a cookie consent banner where you can:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Learn more about each cookie category</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Opt-Out Links</h3>
            <div className="bg-muted p-6 rounded-lg">
              <p className="mb-4">You can opt out of specific tracking services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Google Analytics:</strong> 
                  <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline ml-2">
                    Google Analytics Opt-out Browser Add-on
                  </a>
                </li>
                <li>
                  <strong>Advertising cookies:</strong> 
                  <a href="http://www.youronlinechoices.com/" className="text-primary hover:underline ml-2">
                    Your Online Choices
                  </a>
                </li>
                <li>
                  <strong>Email tracking:</strong> Unsubscribe links in our emails
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookie Duration and Storage</h2>
            
            <h3 className="text-xl font-medium mb-3">Session Cookies</h3>
            <p className="mb-4">
              These are temporary cookies that are deleted when you close your browser. 
              They're used for essential functions like keeping you logged in during your visit.
            </p>

            <h3 className="text-xl font-medium mb-3">Persistent Cookies</h3>
            <p className="mb-4">
              These cookies remain on your device for a specified period:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>30 days:</strong> Preference and settings cookies</li>
              <li><strong>1 year:</strong> Analytics and performance cookies</li>
              <li><strong>2 years:</strong> Marketing and advertising cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Impact of Disabling Cookies</h2>
            <p className="mb-4">
              If you disable cookies, some features may not work properly:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>You may need to log in repeatedly</li>
              <li>Your preferences won't be saved</li>
              <li>Some personalization features won't work</li>
              <li>Analytics and improvement efforts may be limited</li>
              <li>Social sharing features may not function</li>
            </ul>
            <p>
              Essential cookies cannot be disabled as they're necessary for basic website functionality 
              and security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our 
              practices or for other operational, legal, or regulatory reasons. When we make 
              significant changes, we'll notify you through our website or by email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <p><strong>Email:</strong> privacy@kolab.co.uk</p>
              <p><strong>Phone:</strong> +44 20 7123 4567</p>
              <p><strong>Address:</strong> Kolab Ltd, London, United Kingdom</p>
              
              <p className="mt-4">
                For general privacy questions, please see our 
                <span onClick={() => window.location.href = "/privacy"} className="text-primary hover:underline ml-1 cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}