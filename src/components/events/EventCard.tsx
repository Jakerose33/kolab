import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { normalizeEvent, getEventLink } from '@/lib/links';
import { resolveEventImage } from '@/lib/media';
import { SafeImg } from '@/components/media/SafeImg';

type Props = { event: any; className?: string; 'data-testid'?: string };

export default function EventCard({ event, className, ...rest }: Props) {
  const safeId = event?.id ?? '';
  if (!safeId) {
    return (
      <article className={`overflow-hidden ${className ?? ''}`} {...rest} data-testid="event-card">
        <Card className="opacity-60 cursor-not-allowed overflow-hidden">
          <div className="p-6 text-center">
            <div className="text-muted-foreground">No event ID</div>
          </div>
        </Card>
      </article>
    );
  }

  const n = normalizeEvent(event);
  const link = getEventLink(event);
  
  const cardContent = (
    <Card className={`overflow-hidden ${!link ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <SafeImg 
          src={resolveEventImage(event)} 
          alt={n.title} 
          className="h-44 w-full object-cover" 
          fallbackContext="event-card"
        />
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold line-clamp-1">{n.title}</h3>
      </div>
    </Card>
  );

  if (link) {
    return (
      <article className={`overflow-hidden ${className ?? ''}`} {...rest} data-testid="event-card">
        <Link to={link} className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
          {cardContent}
        </Link>
      </article>
    );
  }

  return (
    <article className={`overflow-hidden ${className ?? ''}`} {...rest} data-testid="event-card">
      {cardContent}
    </article>
  );
}