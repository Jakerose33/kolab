import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SEOOptimizer } from '@/components/SEOOptimizer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageCircle,
  HeadphonesIcon,
  Building2,
  Users
} from 'lucide-react';

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      title: "General Inquiries",
      contact: "hello@ko-lab.com.au",
      description: "For general questions about our platform"
    },
    {
      icon: Building2,
      title: "Venue Partnerships",
      contact: "venues@ko-lab.com.au",
      description: "Ready to list your venue? Get in touch"
    },
    {
      icon: HeadphonesIcon,
      title: "Technical Support",
      contact: "support@ko-lab.com.au",
      description: "Need help with bookings or technical issues?"
    },
    {
      icon: Users,
      title: "Press & Media",
      contact: "press@ko-lab.com.au",
      description: "Media inquiries and press kit requests"
    }
  ];

  const supportHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM AEST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM AEST" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <>
      <SEOOptimizer
        page="contact"
        title="Contact Us - Kolab Melbourne | Get in Touch"
        description="Contact Kolab Melbourne for event support, venue partnerships, and technical assistance. We're here to help with your underground culture needs."
        keywords={["contact kolab melbourne", "venue partnerships melbourne", "technical support", "customer service", "melbourne events contact"]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help venue owners, event organizers, and community members succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Methods */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              
              <div className="space-y-6 mb-8">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                          <method.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{method.title}</h3>
                          <a 
                            href={`mailto:${method.contact}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {method.contact}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Details */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Company:</strong> Kolab Pty Ltd
                    </div>
                    <div>
                      <strong>Registration:</strong> Australia ACN 123 456 789
                    </div>
                    <div>
                      <strong>Address:</strong> Melbourne, Victoria, Australia
                    </div>
                    <div>
                      <strong>Phone:</strong> +61 480 734 669
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Hours */}
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {supportHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{schedule.day}</span>
                        <span className="text-muted-foreground">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          First Name *
                        </label>
                        <Input placeholder="Your first name" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Last Name *
                        </label>
                        <Input placeholder="Your last name" required />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Email Address *
                      </label>
                      <Input type="email" placeholder="your.email@example.com" required />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Subject *
                      </label>
                      <Input placeholder="What can we help you with?" required />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Message *
                      </label>
                      <Textarea 
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px]"
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 shadow-sm mt-6 bg-destructive/5 border-destructive/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-destructive mb-2">Emergency Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    For urgent venue safety issues or platform emergencies:
                  </p>
                  <a 
                    href="tel:+61480734669"
                    className="text-sm font-medium text-destructive hover:underline"
                  >
                    +61 480 734 669 (24/7 Emergency Line)
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}