import { Search, Calendar, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Browse",
      description: "Curated city guides & categories"
    },
    {
      icon: Calendar,
      title: "Book / RSVP", 
      description: "One quick flow on mobile"
    },
    {
      icon: Heart,
      title: "Follow",
      description: "Get updates from venues & organisers you like"
    }
  ];

  return (
    <section className="py-12 bg-muted/50">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center">
          <Link 
            to="/about" 
            className="text-primary hover:underline text-sm"
          >
            How Kolab works →
          </Link>
        </div>
      </div>
    </section>
  );
}