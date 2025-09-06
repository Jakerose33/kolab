import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section 
      className="relative isolate overflow-hidden"
      data-visual-edits="hero-section"
      role="banner"
      aria-label="Hero section"
    >
      <img
        src="/images/ .jpg"
        alt="Kolab — discover and book events"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        data-visual-edits="hero-background"
      />

      {/* Soft gradient to keep text readable on busy images */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />

      <div 
        className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28"
        data-visual-edits="hero-content"
      >
        <div className="max-w-4xl">
          <h1 
            className="text-4xl md:text-6xl font-bold tracking-tight text-white"
            data-visual-edits="hero-title"
          >
            Discover events. Grow your scene.
          </h1>
          <p 
            className="mt-4 max-w-2xl text-lg md:text-xl text-white/90"
            data-visual-edits="hero-subtitle"
          >
            Kolab is a city guide and booking hub for locals, venues, and organisers.
          </p>
          
          <div 
            className="mt-8 flex flex-col sm:flex-row gap-4"
            data-visual-edits="hero-buttons"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-black hover:bg-white/90 font-semibold"
              data-visual-edits="primary-cta"
            >
              <Link to="/events?when=tonight">Find events tonight</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black"
              data-visual-edits="secondary-cta"
            >
              <Link to="/auth?mode=organiser">List your event (free)</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
