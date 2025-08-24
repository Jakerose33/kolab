import React from 'react';
import { SEOOptimizer } from '@/components/SEOOptimizer';

export default function TermsOfService() {
  return (
    <>
      <SEOOptimizer
        page="profile"
        title="Terms of Service | Kolab - Underground Culture Platform"
        description="Read Kolab's terms of service for our underground culture platform. Understand your rights and responsibilities as a user."
        keywords={["terms of service", "user agreement", "terms and conditions", "platform rules"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Kolab ("the Platform"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p>
              These Terms of Service ("Terms") govern your use of our underground culture platform operated 
              by Kolab Ltd, a company registered in England and Wales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Kolab is a platform that connects users with underground cultural events, unique venues, 
              and creative communities. Our services include:
            </p>
            <ul className="list-disc pl-6">
              <li>Event discovery and booking</li>
              <li>Venue listings and reservations</li>
              <li>Social networking for creatives</li>
              <li>Career opportunities in culture sector</li>
              <li>Community features and messaging</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
            <p>
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
            <p>
              You must be at least 18 years old to create an account. By registering, you confirm you meet this requirement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct and Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6">
              <li>Use the platform for any unlawful purpose</li>
              <li>Post inappropriate, offensive, or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate others or provide false information</li>
              <li>Spam, solicit, or send unsolicited communications</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to hack, disrupt, or compromise platform security</li>
              <li>Use automated systems to access the platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Event Bookings and Payments</h2>
            
            <h3 className="text-xl font-medium mb-3">Booking Terms</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>All bookings are subject to availability and organizer approval</li>
              <li>Ticket prices are set by event organizers</li>
              <li>We act as an intermediary and are not responsible for event quality</li>
              <li>Cancellation and refund policies vary by event</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Payment Processing</h3>
            <ul className="list-disc pl-6">
              <li>Payments are processed by secure third-party providers</li>
              <li>We do not store your payment information</li>
              <li>Service fees may apply to transactions</li>
              <li>Disputes should be raised within 30 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content and Intellectual Property</h2>
            
            <h3 className="text-xl font-medium mb-3">Your Content</h3>
            <p>
              You retain ownership of content you post, but grant us a license to use, 
              display, and distribute it on the platform. You warrant that your content 
              does not infringe third-party rights.
            </p>

            <h3 className="text-xl font-medium mb-3">Our Content</h3>
            <p>
              All platform content, design, and functionality are owned by Kolab and 
              protected by copyright, trademark, and other laws. You may not copy, 
              modify, or distribute our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information 
              is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, 
              which is incorporated into these Terms by reference.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitation of Liability</h2>
            
            <h3 className="text-xl font-medium mb-3">Service Disclaimer</h3>
            <p>
              The platform is provided "as is" without warranties of any kind. We do not 
              guarantee continuous, error-free, or secure access to our services.
            </p>

            <h3 className="text-xl font-medium mb-3">Event Disclaimer</h3>
            <p>
              We are not responsible for the quality, safety, or legality of events listed 
              on our platform. Users attend events at their own risk.
            </p>

            <h3 className="text-xl font-medium mb-3">Limitation of Liability</h3>
            <p>
              Our liability is limited to the maximum extent permitted by law. We are not 
              liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your account at our discretion for violations of these Terms. 
              You may also delete your account at any time through your account settings.
            </p>
            <p>
              Upon termination, your right to use the platform ceases immediately, but 
              certain provisions of these Terms will survive termination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes will 
              be resolved in the courts of England and Wales.
            </p>
            <p>
              We encourage resolving disputes through direct communication first. For formal 
              complaints, contact us at legal@kolab.co.uk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of 
              material changes via email or platform notification. Continued use after changes 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p><strong>Company:</strong> Kolab Ltd</p>
              <p><strong>Registration:</strong> England and Wales Company No. 12345678</p>
              <p><strong>Address:</strong> London, United Kingdom</p>
              <p><strong>Email:</strong> legal@kolab.co.uk</p>
              <p><strong>Phone:</strong> +44 20 7123 4567</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining 
              provisions will remain in full force and effect.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}