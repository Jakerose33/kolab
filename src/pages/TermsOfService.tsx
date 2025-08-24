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
          
          <p className="text-lg text-muted-foreground mb-4">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            <strong>Jurisdiction:</strong> Victoria, Australia
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Kolab ("we", "our", "us") provides an online platform that enables users to discover, book, 
              and manage events and venues. By accessing or using our services ("Services"), you agree to these 
              Terms of Service. If you do not agree, you must not use our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <ul className="list-disc pl-6">
              <li>You must be at least 18 years old to use Kolab.</li>
              <li>If booking on behalf of an organisation, you confirm you have authority to bind that organisation.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Role of Kolab</h2>
            <ul className="list-disc pl-6">
              <li>Kolab is a technology platform only. We do not organise, operate, or control events or venues listed.</li>
              <li>Venue owners and organisers are responsible for compliance with all safety, licensing, and legal requirements.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Accounts</h2>
            <ul className="list-disc pl-6">
              <li>You must provide accurate, current information when creating an account.</li>
              <li>You are responsible for maintaining confidentiality of your login credentials.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Fees & Payments</h2>
            <ul className="list-disc pl-6">
              <li>Booking payments are processed securely through Stripe.</li>
              <li>Kolab charges a commission (currently 10% per paid booking, subject to change with notice).</li>
              <li>Stripe fees (currently 2.9% + A$0.30) apply per transaction.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Refunds & Cancellations</h2>
            <ul className="list-disc pl-6">
              <li>Refund eligibility is governed by our <a href="/refunds" className="text-primary hover:underline">Refund & Cancellation Policy</a>.</li>
              <li>Kolab may process refunds on behalf of venues, but final responsibility rests with the venue/organiser.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6">
              <li>Misuse the platform for unlawful, harmful, or fraudulent purposes.</li>
              <li>Post misleading, defamatory, or infringing content.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. User-Generated Content</h2>
            <ul className="list-disc pl-6">
              <li>You retain ownership of your content but grant Kolab a non-exclusive licence to use it for promotional purposes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <ul className="list-disc pl-6">
              <li>To the maximum extent permitted by law, Kolab is not liable for indirect, incidental, or consequential damages.</li>
              <li>Our total liability is limited to the amount of fees you paid to Kolab in the past 3 months.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Dispute Resolution</h2>
            <ul className="list-disc pl-6">
              <li>Parties will attempt to resolve disputes amicably.</li>
              <li><strong>Governing law:</strong> Victoria, Australia.</li>
              <li><strong>Jurisdiction:</strong> Courts of Victoria.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}