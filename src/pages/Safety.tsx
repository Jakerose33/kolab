import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEOOptimizer } from '@/components/SEOOptimizer';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Phone, 
  MessageCircle,
  Camera,
  Lock,
  UserCheck,
  Building2,
  Calendar
} from 'lucide-react';

export default function Safety() {
  const safetyPrinciples = [
    {
      icon: UserCheck,
      title: "Verified Community",
      description: "All users and venue partners go through our verification process to ensure authentic, trustworthy community members."
    },
    {
      icon: Building2,
      title: "Venue Standards",
      description: "Partner venues meet safety requirements including fire safety, capacity limits, and emergency procedures."
    },
    {
      icon: Shield,
      title: "Event Moderation",
      description: "Our team reviews all events to ensure they meet community standards and safety guidelines."
    },
    {
      icon: MessageCircle,
      title: "Safe Communication",
      description: "All platform messaging is monitored for inappropriate content with robust reporting mechanisms."
    }
  ];

  const userGuidelines = [
    "Respect all community members regardless of background, identity, or beliefs",
    "Follow venue rules and capacity limits at all times",
    "Do not bring prohibited items (weapons, illegal substances, outside alcohol where not permitted)",
    "Report any concerning behavior or safety issues immediately",
    "Respect photography policies and consent from other attendees",
    "Keep personal belongings secure and be aware of your surroundings",
    "Follow local laws and regulations at all events",
    "Be mindful of noise levels and neighborhood impact"
  ];

  const venueGuidelines = [
    "Maintain current fire safety certificates and emergency procedures",
    "Clearly communicate capacity limits and enforce them strictly",
    "Provide adequate lighting and clear emergency exits",
    "Have first aid supplies readily available",
    "Screen events for appropriate content and community fit",
    "Maintain insurance coverage for venue operations and events",
    "Train staff on emergency procedures and incident response",
    "Keep contact information for local emergency services accessible"
  ];

  const emergencyContacts = [
    { service: "Emergency Services", number: "999", description: "Police, Fire, Ambulance" },
    { service: "Kolab Emergency Line", number: "+44 20 7123 4567", description: "24/7 platform safety issues" },
    { service: "Venue Safety Reporting", number: "+44 20 7123 4568", description: "Report venue safety concerns" },
    { service: "Non-Emergency Police", number: "101", description: "Non-urgent police matters" }
  ];

  return (
    <>
      <SEOOptimizer
        page="profile"
        title="Safety Guidelines | Kolab Community Safety"
        description="Learn about Kolab's commitment to community safety, venue standards, and emergency procedures for underground culture events."
        keywords={["safety guidelines", "community safety", "venue safety", "event safety", "emergency procedures"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Safety Guidelines', url: '/safety' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              Community Safety
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Safety Guidelines</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Creating safe, inclusive spaces for authentic cultural experiences is at the heart of everything we do.
            </p>
          </div>

          {/* Safety Principles */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Safety Commitment</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {safetyPrinciples.map((principle, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-100 text-green-700 flex-shrink-0">
                        <principle.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{principle.title}</h3>
                        <p className="text-muted-foreground text-sm">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Community Guidelines */}
          <section className="mb-12">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Member Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  All community members are expected to follow these guidelines to ensure safe, respectful experiences for everyone:
                </p>
                <ul className="space-y-2">
                  {userGuidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Venue Safety Standards */}
          <section className="mb-12">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Venue Partner Safety Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  All venue partners must meet and maintain these safety standards:
                </p>
                <ul className="space-y-2">
                  {venueGuidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Reporting & Response */}
          <section className="mb-12">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Report Safety Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    If you encounter any safety issues or concerning behavior:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Use the 'Report' button on any event or profile</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">Call our 24/7 emergency line for urgent issues</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Camera className="h-4 w-4 text-primary" />
                      <span className="text-sm">Document incidents with photos/screenshots if safe to do so</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    Privacy & Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Your safety includes digital privacy:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Personal information is never shared without consent</li>
                    <li>• Location data is only used for event recommendations</li>
                    <li>• Messages are encrypted and monitored only for safety</li>
                    <li>• You control your profile visibility and information</li>
                    <li>• Report suspicious messages or data requests</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Emergency Contacts */}
          <section className="mb-12">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="font-semibold text-red-900">{contact.service}</div>
                      <div className="text-xl font-bold text-red-700 my-1">{contact.number}</div>
                      <div className="text-sm text-red-600">{contact.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call to Action */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Questions About Safety?</h3>
              <p className="text-muted-foreground mb-6">
                Our safety team is always available to discuss concerns or answer questions about our guidelines.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/contact">
                    Contact Safety Team
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:safety@kolab.co.uk">
                    Email Safety Team
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