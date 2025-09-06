import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

export function AudienceSplit() {
  return (
    <section 
      className="py-16"
      data-visual-edits="audience-split"
      role="region"
      aria-label="User pathways"
    >
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For Locals */}
          <Card 
            className="border-2 hover:border-primary/50 transition-colors"
            data-visual-edits="locals-card"
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle 
                className="text-xl"
                data-visual-edits="locals-title"
              >
                For locals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="space-y-3 text-muted-foreground"
                data-visual-edits="locals-benefits"
              >
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>See what's on tonight & this week</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Save, share, and RSVP in one tap</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Personalised picks as you go</span>
                </div>
              </div>
              <Button 
                asChild 
                className="w-full mt-6"
                data-visual-edits="locals-cta"
              >
                <Link to="/events">Explore events</Link>
              </Button>
            </CardContent>
          </Card>

          {/* For Organisers */}
          <Card 
            className="border-2 hover:border-accent/50 transition-colors"
            data-visual-edits="organisers-card"
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle 
                className="text-xl"
                data-visual-edits="organisers-title"
              >
                For organisers & venues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="space-y-3 text-muted-foreground"
                data-visual-edits="organisers-benefits"
              >
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Get discovered without paid ads</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Capture interest & bookings easily</span>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Build repeat audiences</span>
                </div>
              </div>
              <Button 
                asChild 
                variant="outline" 
                className="w-full mt-6"
                data-visual-edits="organisers-cta"
              >
                <Link to="/auth?mode=organiser">List your event (free)</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}