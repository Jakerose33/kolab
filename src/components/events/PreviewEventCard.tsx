import { Card } from '@/components/ui/card';
import { normalizeEvent, getEventLink } from '@/lib/links';
import { resolveEventImage } from '@/lib/media';
import { SafeImg } from '@/components/media/SafeImg';

type Props = { event: any; className?: string; 'data-testid'?: string; onClick?: () => void };

export default function PreviewEventCard({ event, className, onClick, ...rest }: Props) {
  const n = normalizeEvent(event);
  const link = getEventLink(event);
  
  return (
    <article className={`overflow-hidden ${className ?? ''}`} {...rest} data-testid="event-card">
      <Card 
        className={`overflow-hidden ${!link ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md transition-shadow'}`}
        onClick={link ? onClick : undefined}
      >
        <div className="relative">
          <SafeImg 
            src={resolveEventImage(event)} 
            alt={n.title} 
            className="h-44 w-full object-cover" 
            fallbackContext="preview-event-card"
          />
        </div>
        <div className="p-3">
          <h3 className="text-base font-semibold line-clamp-1">{n.title}</h3>
          <div className="mt-2 text-sm text-muted-foreground">
            {link ? 'Sign in to view details' : 'Event unavailable'}
          </div>
        </div>
      </Card>
    </article>
  );
}