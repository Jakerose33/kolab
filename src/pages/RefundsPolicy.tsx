import React from 'react';
import { SEOOptimizer } from '@/components/SEOOptimizer';

export default function RefundsPolicy() {
  return (
    <>
      <SEOOptimizer
        page="home"
        title="Refunds & Cancellation Policy | Kolab - Underground Culture Platform"
        description="Learn about Kolab's refund and cancellation policies for venue bookings and events. Fair and transparent terms for all users."
        keywords={["refunds policy", "cancellation policy", "venue booking", "event cancellation", "australian consumer law"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Refunds Policy', url: '/refunds' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Refunds & Cancellation Policy</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. General Policy</h2>
            <p>
              Kolab provides a platform for booking venues and events. Refunds are primarily the responsibility 
              of the venue or organiser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Cancellations by Users</h2>
            <ul className="list-disc pl-6">
              <li>Refund eligibility depends on the venue/organiser's cancellation policy (shown at booking).</li>
              <li>If no policy is provided, the default is:</li>
            </ul>
            <div className="ml-6 mt-4">
              <ul className="list-disc pl-6">
                <li><strong>Cancellation 7+ days before event:</strong> 100% refund (minus processing fees).</li>
                <li><strong>Cancellation 3-6 days:</strong> 50% refund.</li>
                <li><strong>Cancellation less than 72 hours:</strong> non-refundable.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cancellations by Venue/Organiser</h2>
            <ul className="list-disc pl-6">
              <li>If a venue cancels, users are entitled to a full refund (including fees).</li>
              <li>Kolab will assist in processing these refunds promptly.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. No-Shows</h2>
            <p>
              No refunds for attendee no-shows unless required by Australian Consumer Law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Processing</h2>
            <ul className="list-disc pl-6">
              <li>Refunds are issued back to the original payment method via Stripe.</li>
              <li><strong>Processing times:</strong> 5–10 business days.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Consumer Law</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p>
                Nothing in this Policy limits your rights under the Australian Consumer Law.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}