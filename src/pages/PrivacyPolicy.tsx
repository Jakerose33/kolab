import React from 'react';
import { SEOOptimizer } from '@/components/SEOOptimizer';

export default function PrivacyPolicy() {
  return (
    <>
      <SEOOptimizer
        page="profile"
        title="Privacy Policy | Kolab - Underground Culture Platform"
        description="Learn how Kolab protects your privacy and handles your personal data. Comprehensive privacy policy for our underground culture platform."
        keywords={["privacy policy", "data protection", "GDPR", "privacy rights", "data security"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Kolab ("we," "our," or "us"). This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our underground culture platform and services.
            </p>
            <p>
              We are committed to protecting your privacy and ensuring you have a positive experience on our platform. 
              This policy complies with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name and contact information (email, phone number)</li>
              <li>Profile information and preferences</li>
              <li>Event attendance and booking history</li>
              <li>Payment information (processed securely by third parties)</li>
              <li>Communications and messages within the platform</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and location data</li>
              <li>Device information and browser type</li>
              <li>Usage data and platform interactions</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>Provide and improve our platform services</li>
              <li>Process bookings and facilitate event attendance</li>
              <li>Send relevant notifications and updates</li>
              <li>Personalize your experience and recommendations</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6">
              <li><strong>Event organizers:</strong> When you RSVP to events</li>
              <li><strong>Venue partners:</strong> For booking confirmations and access</li>
              <li><strong>Service providers:</strong> Payment processors, email services, analytics</li>
              <li><strong>Legal authorities:</strong> When required by law or to protect rights</li>
            </ul>
            <p className="mt-4">
              We never sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Privacy Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your data (right to be forgotten)</li>
              <li>Restrict processing of your data</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@kolab.co.uk
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6">
              <li>SSL encryption for data transmission</li>
              <li>Secure servers and databases</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Limited access to personal data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. You can manage 
              cookie preferences through your browser settings. For detailed information, see our 
              <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside the UK. 
              We ensure adequate protection through appropriate safeguards such as Standard 
              Contractual Clauses or adequacy decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p>
              We retain your personal data only as long as necessary for the purposes outlined 
              in this policy or as required by law. When data is no longer needed, we securely 
              delete or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p><strong>Data Controller:</strong> Kolab Ltd</p>
              <p><strong>Address:</strong> London, United Kingdom</p>
              <p><strong>Email:</strong> privacy@kolab.co.uk</p>
              <p><strong>Phone:</strong> +44 20 7123 4567</p>
              
              <p className="mt-4">
                <strong>Data Protection Officer:</strong> dpo@kolab.co.uk
              </p>
              
              <p className="mt-4">
                You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) 
                if you believe we have not handled your data appropriately.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}