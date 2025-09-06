import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

export function AudienceSplit() {
  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For Locals */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">For locals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  See what's on tonight & this week
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Save, share, and RSVP in one tap
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Personalised picks as you go
                </li>
              </ul>
              <Button asChild className="w-full mt-6">
                <Link to="/events">Explore events</Link>
              </Button>
            </CardContent>
          </Card>

          {/* For Organisers */}
          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">For organisers & venues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Get discovered without paid ads
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Capture interest & bookings easily
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Build repeat audiences
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full mt-6">
                <Link to="/auth?mode=organiser">List your event (free)</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}