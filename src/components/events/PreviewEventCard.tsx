import { Card } from '@/components/ui/card';
import { normalizeEvent } from '@/lib/linking';

type Props = { event: any; className?: string; 'data-testid'?: string };

export default function PreviewEventCard({ event, className, ...rest }: Props) {
  const n = normalizeEvent(event);
  
  return (
    <article className={`overflow-hidden ${className ?? ''}`} {...rest}>
      <Card className="overflow-hidden">
        <div className="relative">
          {n.image ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={n.image} alt={n.title} className="h-44 w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-44 w-full bg-muted" />
          )}
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