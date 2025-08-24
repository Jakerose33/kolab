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
              This Privacy Policy explains how Kolab collects, uses, and protects your personal information 
              in compliance with the Privacy Act 1988 (Cth).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6">
              <li><strong>Account data:</strong> name, email, password.</li>
              <li><strong>Booking data:</strong> venue, payment, attendance.</li>
              <li><strong>Payment details:</strong> processed securely via Stripe (we do not store card details).</li>
              <li><strong>Technical data:</strong> cookies, analytics, device/browser information.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>To operate the Kolab platform.</li>
              <li>To process bookings and payments.</li>
              <li>To communicate updates, confirmations, and marketing (if opted in).</li>
              <li>To improve and secure our Services.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <ul className="list-disc pl-6">
              <li>With venues/organisers for booked events.</li>
              <li>With third-party providers (Stripe, Supabase, analytics).</li>
              <li>Where required by law or to enforce our rights.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookies & Analytics</h2>
            <p>
              We use cookies and services like Google Analytics to measure usage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security & Retention</h2>
            <ul className="list-disc pl-6">
              <li>Data is stored securely via Supabase/Stripe.</li>
              <li>Retention only as long as necessary for business and legal purposes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <ul className="list-disc pl-6">
              <li>Access and correct your information.</li>
              <li>Opt out of marketing communications.</li>
              <li>Request deletion of your account (subject to legal obligations).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p><strong>Email:</strong> privacy@ko-lab.com.au</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}