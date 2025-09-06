import React from 'react';
import { SafeImg } from '@/components/media/SafeImg';
import { resolveImageUrl } from '@/lib/media';

/**
 * Hero image source order:
 * 1) VITE_HERO_IMAGE_URL (e.g., Supabase public URL or CDN)
 * 2) /hero/kolab-hero.jpg (put this in /public/hero/)
 * If the src fails at runtime, we fall back to a local placeholder.
 */

const DEFAULT_HERO = '/hero/kolab-hero.jpg';
const HERO_SRC = resolveImageUrl(import.meta.env.VITE_HERO_IMAGE_URL ?? DEFAULT_HERO);

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <SafeImg
        src={HERO_SRC}
        alt="Kolab — discover and book events"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
        loading="eager"
        fallbackContext="hero"
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
  );
}
