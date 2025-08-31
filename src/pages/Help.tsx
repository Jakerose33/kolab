import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEOOptimizer } from '@/components/SEOOptimizer';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Building2,
  Users,
  Calendar,
  CreditCard,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = [
    { icon: Building2, title: "Venue Partners", count: 12, color: "bg-blue-100 text-blue-700" },
    { icon: Calendar, title: "Event Organizers", count: 15, color: "bg-green-100 text-green-700" },
    { icon: Users, title: "Community Members", count: 18, color: "bg-purple-100 text-purple-700" },
    { icon: CreditCard, title: "Payments & Billing", count: 8, color: "bg-orange-100 text-orange-700" },
    { icon: Shield, title: "Safety & Security", count: 6, color: "bg-red-100 text-red-700" }
  ];

  const venueOwnerFAQs = [
    {
      question: "How do I list my venue on Kolab?",
      answer: "Getting started is simple! Click 'Partner with Us' on our homepage, fill out the venue application form with your space details, photos, and availability. Our team reviews all applications within 24 hours and will contact you with next steps."
    },
    {
      question: "What commission does Kolab charge?",
      answer: "We charge 0% commission on direct bookings made through your venue profile. For events promoted through our platform, we charge a small 5% platform fee only when bookings are successful. No setup fees or monthly charges."
    },
    {
      question: "How do I manage my venue availability?",
      answer: "Your venue dashboard includes a calendar management system where you can block out dates, set pricing, and manage booking requests. You'll receive instant notifications for new inquiries and can approve/decline bookings directly through the platform."
    },
    {
      question: "What types of events work best on Kolab?",
      answer: "Our community loves authentic experiences: art exhibitions, intimate music performances, warehouse parties, creative workshops, pop-up markets, and underground cultural events. We focus on unique, creative experiences rather than mainstream commercial events."
    },
    {
      question: "How does payment processing work?",
      answer: "We use secure payment processors (Stripe) to handle all transactions. Payments are automatically transferred to your account within 2-3 business days after an event concludes. You can track all earnings through your venue dashboard."
    },
    {
      question: "What support do you provide to venue partners?",
      answer: "You get dedicated support including: venue optimization guidance, photography assistance, marketing support, customer service for your bookings, and a dedicated venue partner success manager for any questions or issues."
    },
    {
      question: "How do you ensure quality events and organizers?",
      answer: "All event organizers are verified through our application process. We review event proposals for quality and alignment with our community values. Our rating system helps maintain high standards, and we have a 24/7 support line for any issues."
    },
    {
      question: "Can I set my own pricing and terms?",
      answer: "Absolutely! You control your hourly rates, minimum booking requirements, cancellation policies, and any special terms. Our platform provides pricing recommendations based on similar venues, but final pricing decisions are always yours."
    }
  ];

  const generalFAQs = [
    {
      question: "How do I create an account?",
      answer: "Click 'Sign Up' in the top right corner, enter your email and create a password. You can also sign up during the event booking process. Verification is instant and you'll have access to all platform features immediately."
    },
    {
      question: "Is Kolab free to use?",
      answer: "Yes! Browsing events, joining the community, and basic features are completely free. We only charge venue partners a small success fee for bookings, and there may be booking fees for certain premium events."
    },
    {
      question: "How do I find events near me?",
      answer: "Use our search function with location filters, browse by category (music, art, culture), or check out our curated recommendations. Our algorithm learns your preferences to show the most relevant events for your interests."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellation policies vary by event and venue. Each event listing shows the specific cancellation terms. Generally, you can cancel up to 24-48 hours before an event for a full refund, but check individual event policies."
    },
    {
      question: "How do I report inappropriate content or behavior?",
      answer: "User safety is our priority. Use the 'Report' button on any event, profile, or message. Our moderation team reviews all reports within hours. For urgent safety concerns, call our 24/7 emergency line: +44 20 7123 4567."
    },
    {
      question: "Can I organize my own events?",
      answer: "Yes! Click 'Create Event' in your dashboard. You can organize events at partner venues or submit your own space for approval. Our event creation wizard guides you through the entire process."
    }
  ];

  const filteredVenueFAQs = venueOwnerFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGeneralFAQs = generalFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOOptimizer
        page="profile"
        title="Help Center & FAQ | Kolab Support"
        description="Find answers to common questions about Kolab. Support for venue partners, event organizers, and community members."
        keywords={["help center", "FAQ", "venue partners", "kolab support", "event platform help"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Help Center', url: '/help' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Help Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Venue Owner FAQs */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Venue Partner FAQ</h2>
              <Badge variant="secondary">Most Popular</Badge>
            </div>
            
            <div className="space-y-4">
              {filteredVenueFAQs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* General FAQs */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">General Questions</h2>
            </div>
            
            <div className="space-y-4">
              {filteredGeneralFAQs.map((faq, index) => (
                <Card key={index + 100} className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === (index + 100) ? null : (index + 100))}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFAQ === (index + 100) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedFAQ === (index + 100) && (
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Support CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you succeed. Get in touch and we'll respond within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => window.location.href = "/contact"}>
                  Contact Support
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="mailto:venues@kolab.co.uk">
                    Email Venue Team
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}