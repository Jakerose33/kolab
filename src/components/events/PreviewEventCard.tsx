import { Card } from '@/components/ui/card';
import { normalizeEvent } from '@/lib/linking';
import { resolveEventImage } from '@/lib/media';

type Props = { event: any; className?: string; 'data-testid'?: string };

export default function PreviewEventCard({ event, className, ...rest }: Props) {
  const n = normalizeEvent(event);
  
  return (
    <article className={`overflow-hidden ${className ?? ''}`} {...rest} data-testid="event-card">
      <Card className="overflow-hidden">
        <div className="relative">
          <img 
            src={resolveEventImage(event)} 
            alt={n.title} 
            className="h-44 w-full object-cover" 
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/placeholders/event.jpg';
            }}
          />
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