import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { normalizeEvent, getEventLink } from '@/lib/links';
import { resolveEventImage } from '@/lib/media';

type Props = { event: any; className?: string; 'data-testid'?: string };

export default function EventCard({ event, className, ...rest }: Props) {
  const n = normalizeEvent(event);
  const link = getEventLink(event);
  
  const cardContent = (
    <Card className={`overflow-hidden ${!link ? 'opacity-60 cursor-not-allowed' : ''}`}>
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