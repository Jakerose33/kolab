import { Button } from "@/components/ui/button";
import { Calendar, Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  type: 'events' | 'city-guide';
  searchQuery?: string;
  category?: string;
}

export function EmptyState({ type, searchQuery, category }: EmptyStateProps) {
  if (type === 'events') {
    return (
      <div className="text-center py-16">
        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-4">No events found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          No events match your filters. Try "Tonight" or change the category.
        </p>
        <div className="space-y-2">
          <Button asChild>
            <Link to="/events?when=tonight">Browse tonight's events</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/events">See all events</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'city-guide') {
    return (
      <div className="text-center py-16">
        <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-4">We're curating Melbourne first</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Want to launch your city? Get in touch and we'll work with you to curate the best spots.
        </p>
        <Button asChild>
          <Link to="/contact">Contact us</Link>
        </Button>
      </div>
    );
  }

  return null;
}