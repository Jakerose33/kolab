import React from 'react';
import { SafeImg } from '@/components/media/SafeImg';
import { resolveImageUrl } from '@/lib/media';
import { ImageDebugger } from '@/components/debug/ImageDebugger';
import heroImage from '@/assets/hero-boiler-room.jpg';

/**
 * Hero image source order:
 * 1) VITE_HERO_IMAGE_URL (e.g., Supabase public URL or CDN)
 * 2) Vite-processed hero image (import)
 * If the src fails at runtime, we fall back to a local placeholder.
 */

const HERO_SRC = import.meta.env.VITE_HERO_IMAGE_URL 
  ? resolveImageUrl(import.meta.env.VITE_HERO_IMAGE_URL) 
  : heroImage;

console.log('[HERO DEBUG]', {
  envVar: import.meta.env.VITE_HERO_IMAGE_URL,
  heroImageImport: heroImage,
  finalSrc: HERO_SRC
});

export default function Hero() {
  return (
    <>
      <ImageDebugger />
      <section className="relative isolate overflow-hidden">
        {/* Temporarily test both approaches */}
        <SafeImg
          src={HERO_SRC}
          alt="Kolab — discover and book events"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
          loading="eager"
          fallbackContext="hero"
        />
        
        {/* Backup test with direct import */}
        <img
          src={heroImage}
          alt="Backup hero test"
          className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none"
          onLoad={() => console.log('[BACKUP HERO] Direct import loaded successfully')}
          onError={() => console.log('[BACKUP HERO] Direct import failed')}
        />

      {/* Soft gradient to keep text readable on busy images */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Where your city comes alive
        </h1>
        <p className="mt-4 max-w-xl text-base md:text-lg text-muted-foreground">
          Discover, book, and grow your community with Kolab.
        </p>
      </div>
    </section>
    </>
  );
}
