import { Card } from '@/components/ui/card';
import { normalizeEvent } from '@/lib/linking';

type Props = { event: any; className?: string; 'data-testid'?: string };

export default function PreviewEventCard({ event, className, ...rest }: Props) {
  const n = normalizeEvent(event);
  
  return (
    <article className={`overflow-hidden ${className ?? ''}`} {...rest} data-testid="event-card">
      <Card className="overflow-hidden">
        <div className="relative">
          {n.image ? (
            <img 
              src={n.image} 
              alt={n.title} 
              className="h-44 w-full object-cover" 
              loading="lazy"
              onError={(e) => {
                console.log('Preview image failed to load:', n.image);
                e.currentTarget.style.display = 'none';
                const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextEl) nextEl.style.display = 'block';
              }}
            />
          ) : null}
          <div className="h-44 w-full bg-muted flex items-center justify-center text-muted-foreground" style={{ display: n.image ? 'none' : 'block' }}>
            No image available
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-base font-semibold line-clamp-1">{n.title}</h3>
          <div className="mt-2 text-sm text-muted-foreground">
            Sign in to view details
          </div>
        </div>
      </Card>
    </article>
  );
}