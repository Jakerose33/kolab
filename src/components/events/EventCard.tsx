import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { getEventLink, normalizeEvent } from '@/lib/entities';

type Props = { event: any; className?: string; 'data-testid'?: string };

export default function EventCard({ event, className, ...rest }: Props) {
  const norm = normalizeEvent(event);
  const link = getEventLink(event);

  const body = (
    <Card
      className={`overflow-hidden ${!link ? 'opacity-60 pointer-events-none' : ''} ${className ?? ''}`}
      {...rest}
    >
      {norm.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={norm.image} alt={norm.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="h-44 w-full bg-muted" />
      )}
      <div className="p-3">
        <h3 className="text-base font-semibold line-clamp-1">{norm.title}</h3>
      </div>
    </Card>
  );

  return link ? (
    <Link to={link} className="block" aria-label={`View ${norm.title}`}>
      {body}
    </Link>
  ) : (
    body
  );
}