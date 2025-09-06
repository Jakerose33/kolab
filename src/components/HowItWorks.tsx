import { Search, Calendar, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function HowItWorks() {
  return (
    <section 
      className="py-12 bg-muted/50"
      data-visual-edits="how-it-works"
      role="region"
      aria-label="How Kolab works"
    >
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            data-visual-edits="heading"
          >
            How it works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 - Browse */}
            <div 
              className="text-center"
              data-visual-edits="step-card"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                data-visual-edits="step-title"
              >
                Browse
              </h3>
              <p 
                className="text-muted-foreground"
                data-visual-edits="step-description"
              >
                Curated city guides & categories
              </p>
            </div>

            {/* Step 2 - Book */}
            <div 
              className="text-center"
              data-visual-edits="step-card"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                data-visual-edits="step-title"
              >
                Book / RSVP
              </h3>
              <p 
                className="text-muted-foreground"
                data-visual-edits="step-description"
              >
                One quick flow on mobile
              </p>
            </div>

            {/* Step 3 - Follow */}
            <div 
              className="text-center"
              data-visual-edits="step-card"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                data-visual-edits="step-title"
              >
                Follow
              </h3>
              <p 
                className="text-muted-foreground"
                data-visual-edits="step-description"
              >
                Get updates from venues & organisers you like
              </p>
            </div>
          </div>
        </div>
        
        <div 
          className="text-center"
          data-visual-edits="cta-section"
        >
          <Link 
            to="/about" 
            className="text-primary hover:underline text-sm"
            data-visual-edits="cta-link"
          >
            How Kolab works →
          </Link>
        </div>
      </div>
    </section>
  );
}