import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BookingCTA from '@/components/booking/BookingCTA';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function EventDetail() {
  const params = useParams();
  const navigate = useNavigate();

  const key = useMemo(() => {
    const raw = params.id ?? (params as any).idOrSlug ?? (params as any).eventId ?? null;
    const val = String(raw ?? '');
    return !val || val === 'undefined' || val === 'null' ? null : val;
  }, [params]);

  // If route param is missing/invalid, don't throw—show friendly state.
  if (!key) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>We couldn't load this event (invalid link).</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild><Link to="/events">Back to events</Link></Button>
        </div>
      </div>
    );
  }

  const query = useQuery({
    queryKey: ['event', key],
    queryFn: async () => {
      // match by id OR slug; .maybeSingle() avoids throwing when not found
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`id.eq.${key},slug.eq.${key}`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found -> treat as not-found, not crash
        throw error;
      }
      return data ?? null;
    },
  });

  if (query.isLoading) {
    return <div className="max-w-3xl mx-auto p-6">Loading…</div>;
  }

  if (query.isError) {
    console.error('[EventDetail] query error:', query.error);
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>We couldn't load this event.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate(0)}>Try again</Button>
        </div>
      </div>
    );
  }

  const event = query.data;
  if (!event) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>This event was not found.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild><Link to="/events">Back to events</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>← Back</Button>

      <h1 className="text-2xl font-bold">{(event as any).title ?? (event as any).name ?? 'Untitled Event'}</h1>
      {(event as any).heroImage || (event as any).image || (event as any).image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(event as any).heroImage ?? (event as any).image ?? (event as any).image_url}
          alt={(event as any).title ?? (event as any).name ?? 'Event image'}
          className="mt-4 w-full max-h-[420px] object-cover rounded-lg"
        />
      ) : null}

      <div className="mt-6">
        <BookingCTA className="w-full sm:w-auto" />
      </div>

      {event.description ? (
        <div className="mt-8 prose max-w-none">
          <h2>About this event</h2>
          <p>{event.description}</p>
        </div>
      ) : null}
    </div>
  );
}