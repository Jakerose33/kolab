import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, FileText, HelpCircle } from 'lucide-react';
export function Footer() {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kolab</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Your backstage pass to underground culture. Connecting you to exclusive events, 
              hidden venues, and creative communities across Melbourne.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Melbourne, Australia
              </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:hello@ko-lab.com.au" className="hover:text-primary">
                  hello@ko-lab.com.au
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+442071234567" className="hover:text-primary">+61 480 734 669</a>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><span onClick={() => window.location.href = "/events"} className="text-muted-foreground hover:text-primary cursor-pointer">Events</span></li>
              <li><span onClick={() => window.location.href = "/venues"} className="text-muted-foreground hover:text-primary cursor-pointer">Venues</span></li>
              <li><span onClick={() => window.location.href = "/careers"} className="text-muted-foreground hover:text-primary cursor-pointer">Careers</span></li>
              <li><span onClick={() => window.location.href = "/social"} className="text-muted-foreground hover:text-primary cursor-pointer">Community</span></li>
              <li><span onClick={() => window.location.href = "/venue-partners"} className="text-muted-foreground hover:text-primary cursor-pointer">Partner with Us</span></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><span onClick={() => window.location.href = "/help"} className="text-muted-foreground hover:text-primary cursor-pointer">Help Center</span></li>
              <li><span onClick={() => window.location.href = "/contact"} className="text-muted-foreground hover:text-primary cursor-pointer">Contact Support</span></li>
              <li><span onClick={() => window.location.href = "/safety"} className="text-muted-foreground hover:text-primary cursor-pointer">Safety Guidelines</span></li>
              <li><span onClick={() => window.location.href = "/community-guidelines"} className="text-muted-foreground hover:text-primary cursor-pointer">Community Guidelines</span></li>
              <li><span onClick={() => window.location.href = "/accessibility"} className="text-muted-foreground hover:text-primary cursor-pointer">Accessibility</span></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li><span onClick={() => window.location.href = "/privacy"} className="text-muted-foreground hover:text-primary cursor-pointer">Privacy Policy</span></li>
              <li><span onClick={() => window.location.href = "/terms"} className="text-muted-foreground hover:text-primary cursor-pointer">Terms of Service</span></li>
              <li><span onClick={() => window.location.href = "/cookies"} className="text-muted-foreground hover:text-primary cursor-pointer">Cookie Policy</span></li>
              <li><span onClick={() => window.location.href = "/about"} className="text-muted-foreground hover:text-primary cursor-pointer">About Us</span></li>
            </ul>

            <div>
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {/* Social icons hidden until real profiles are provided */}
                {/* 
                <a href="https://instagram.com/kolab_melbourne" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Follow us on Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/kolab_melb" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Follow us on Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://facebook.com/kolabmelbourne" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Follow us on Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/company/kolab-melbourne" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Follow us on LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                */}
                <p className="text-sm text-muted-foreground">Follow us on social media - coming soon!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Kolab Ltd. All rights reserved. Company Registration: 12345678
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}