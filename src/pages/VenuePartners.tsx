import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  Calendar,
  MapPin,
  Star,
  DollarSign
} from 'lucide-react';

export default function VenuePartnerLanding() {
  const benefits = [
    {
      icon: Users,
      title: "Access 10,000+ Culture Enthusiasts",
      description: "Reach highly engaged underground culture fans actively seeking unique experiences."
    },
    {
      icon: TrendingUp,
      title: "Increase Bookings by 40%",
      description: "Our venues see average 40% increase in bookings within 3 months of joining."
    },
    {
      icon: Calendar,
      title: "Smart Booking Management",
      description: "Streamlined booking system with automated confirmations and payment processing."
    },
    {
      icon: DollarSign,
      title: "Zero Commission on Direct Bookings",
      description: "Keep 100% of your revenue for events booked directly through your venue profile."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      venue: "Underground Gallery London",
      quote: "Kolab connected us with the perfect creative community. Our bookings tripled in just 2 months.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      venue: "Warehouse 23",
      quote: "The platform attracts exactly the right crowd - people who appreciate authentic underground culture.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      venue: "The Hidden Room",
      quote: "Professional, reliable, and brings us quality events that align with our venue's vibe.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-primary-hover to-accent py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-primary-foreground">
            <Badge className="mb-4 bg-background/20 text-primary-foreground border-primary-foreground/20">
              Partner with Kolab
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your Venue Into a
              <span className="block text-accent-foreground">Cultural Destination</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Join London's most exclusive network of underground venues and connect with 
              passionate culture enthusiasts seeking authentic experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-background text-primary hover:bg-background/90">
                <Building2 className="mr-2 h-5 w-5" />
                List Your Venue
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Download Partnership Kit
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">15,000+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Partner Venues</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-muted-foreground">Events Hosted</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">£2.5M+</div>
              <div className="text-muted-foreground">Revenue Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Top Venues Choose Kolab
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're not just another booking platform. We're your partner in building a thriving cultural ecosystem.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by London's Best Venues
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.venue}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Partnership Process
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in less than 24 hours
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Apply & Verify</h3>
              <p className="text-muted-foreground">
                Submit your venue details and we'll verify your space within 24 hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Setup Profile</h3>
              <p className="text-muted-foreground">
                Create your stunning venue profile with photos and availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
              <p className="text-muted-foreground">
                Begin receiving bookings from our engaged community immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join London's Underground Culture Network?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Limited spaces available. Apply now to secure your spot in our exclusive venue network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-background text-primary hover:bg-background/90">
                <Building2 className="mr-2 h-5 w-5" />
                Apply Now - Free
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Schedule Demo Call
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              No setup fees • No monthly charges • Only 5% commission on platform bookings
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Insured Platform</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}