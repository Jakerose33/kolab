import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEOOptimizer } from '@/components/SEOOptimizer';
import { 
  Users, 
  Calendar,
  MapPin,
  TrendingUp,
  Shield,
  Heart,
  Target,
  Globe
} from 'lucide-react';

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Co-Founder & CEO",
      background: "Former Resident Advisor, 8 years in underground culture"
    },
    {
      name: "Marcus Rodriguez",
      role: "Co-Founder & CTO", 
      background: "Tech Lead at Mixcloud, Built platforms for 2M+ users"
    },
    {
      name: "Emma Thompson",
      role: "Head of Community",
      background: "Former Boiler Room, Connected 500+ venues globally"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Members", value: "15,000+" },
    { icon: Calendar, label: "Events Hosted", value: "50,000+" },
    { icon: MapPin, label: "Partner Venues", value: "200+" },
    { icon: TrendingUp, label: "Revenue Generated", value: "£2.5M+" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Authenticity First",
      description: "We celebrate genuine underground culture, not commercialized experiences."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our platform is built by creatives, for creatives, fostering real connections."
    },
    {
      icon: Shield,
      title: "Safe Spaces",
      description: "We prioritize the safety and security of our community members."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making underground culture accessible to everyone, regardless of background."
    }
  ];

  return (
    <>
      <SEOOptimizer
        page="profile"
        title="About Kolab | Underground Culture Platform | London"
        description="Learn about Kolab's mission to connect underground culture enthusiasts with exclusive events and hidden venues across London. Meet our team and discover our story."
        keywords={["about kolab", "underground culture", "london events", "creative community", "company story"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about' }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-primary via-primary-hover to-accent">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-background/20 text-primary-foreground border-primary-foreground/20">
              About Kolab
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground">
              Where Underground
              <span className="block text-accent-foreground">Culture Thrives</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-foreground/90">
              We're more than a platform – we're the pulse of London's hidden cultural heartbeat, 
              connecting passionate souls with authentic experiences.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To democratize access to underground culture by creating a trusted ecosystem where 
                authentic creators, unique venues, and passionate communities can discover, connect, 
                and collaborate. We believe the best cultural experiences happen in intimate spaces, 
                driven by genuine passion rather than commercial algorithms.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Kolab was born from a simple frustration: the best cultural experiences were 
                    hidden behind closed doors, accessible only to those "in the know." Founded in 2024 
                    by three underground culture veterans, we set out to change this.
                  </p>
                  <p>
                    Having organized countless warehouse parties, gallery openings, and intimate gigs, 
                    we understood the challenge of connecting authentic creators with their ideal audience. 
                    Traditional event platforms felt too corporate, too algorithm-driven, too disconnected 
                    from the underground ethos.
                  </p>
                  <p>
                    So we built something different. Kolab is designed by the underground, for the underground. 
                    Every feature reflects our commitment to authenticity, community, and creative expression.
                  </p>
                </div>
              </div>
              <div>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <blockquote className="text-lg italic mb-4">
                      "We believe the most transformative cultural experiences happen when passionate 
                      creators meet curious souls in intimate, unexpected spaces."
                    </blockquote>
                    <cite className="text-sm text-muted-foreground">— Sarah Chen, Co-Founder</cite>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Stand For</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our values guide every decision we make and every feature we build.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
              <p className="text-xl text-muted-foreground">
                Passionate creators building tools for the underground community
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardContent className="pt-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.background}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Impact</h2>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-xl font-semibold mb-4">For Creators & Venues</h3>
                  <ul className="space-y-2 opacity-90">
                    <li>• £2.5M+ revenue generated for partners</li>
                    <li>• 40% average increase in bookings</li>
                    <li>• 200+ venues discovered new audiences</li>
                    <li>• 1,000+ artists found their community</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">For the Community</h3>
                  <ul className="space-y-2 opacity-90">
                    <li>• 50,000+ unforgettable experiences created</li>
                    <li>• 15,000+ connections made between creatives</li>
                    <li>• 500+ first-time venue discoveries monthly</li>
                    <li>• 95% positive experience rating</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Join Our Story</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Whether you're a creator, venue owner, or culture enthusiast, 
                there's a place for you in the Kolab community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.location.href = "/venue-partners"}>
                  Partner with Us
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "/contact"}>
                  Get in Touch
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}