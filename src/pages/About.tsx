import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, Heart, Users, Megaphone, Shield, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";

export default function About() {
  return (
    <SafeErrorBoundary>
      <SEOHead 
        title="About Kolab - How It Works"
        description="Learn how Kolab helps locals discover great events and helps organisers grow their communities. Free event listing platform for the underground scene."
        keywords={["about kolab", "how kolab works", "event platform", "community building"]}
      />
      
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How Kolab works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We help locals find great nights out, and we help organisers fill shows and grow their communities.
          </p>
        </div>

        {/* What is Kolab */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What is Kolab?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kolab is an events discovery and booking platform. We help locals find great nights out, 
                and we help organisers fill shows and grow their communities.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How it works for locals */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How Kolab works for locals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>1. Browse guides & categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Discover curated events and city guides tailored to your interests.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>2. Tap RSVP or Get tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Quick and easy booking process optimized for mobile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle>3. Follow favourite venues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Get reminders and updates from your favorite venues and organisers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works for organisers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How Kolab works for organisers & venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle>1. Create a profile & add events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Set up your venue or organiser profile and start listing events.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle>2. Share your Kolab link or embed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Promote your events across social media and your website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle>3. Capture interest & bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  View insights and manage your growing community.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Kolab vs socials */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Why Kolab vs. socials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Less noise, faster booking, and your audience actually sees your updates.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Pricing */}
        <section className="mb-16">
          <Card>
            <CardHeader className="text-center">
              <DollarSign className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4" />
              <CardTitle className="text-2xl">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Free to list. Optional paid tools coming soon.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Safety & Trust */}
        <section className="mb-16">
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4" />
              <CardTitle className="text-2xl">Safety & Trust</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                All events are curated by our team. We have robust reporting systems in place to ensure 
                a safe and trusted community for everyone.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section className="text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Get in touch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                Have questions or want to get involved?
              </p>
              <Button asChild>
                <Link to="/contact">Contact us</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </SafeErrorBoundary>
  );
}