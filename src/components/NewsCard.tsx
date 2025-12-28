import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NewsCardProps {
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  slug: string;
  index: number;
  tournamentId?: number;
}

export default function NewsCard({
  title,
  description,
  image,
  date,
  category,
  slug,
  index,
  tournamentId,
}: NewsCardProps) {
  const cardAnimation = useScrollAnimation({ threshold: 0.2 });

  return (
    <article
      ref={cardAnimation.ref}
      className={`gradient-border bg-card overflow-hidden hover-lift group transition-all duration-700 ${
        cardAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold font-mono pixel-corners">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Icon name="Calendar" className="h-4 w-4" />
          <time>{date}</time>
        </div>

        <h3 className="text-2xl font-black text-foreground group-hover:text-gradient transition-all">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>

        <div className="space-y-2">
          {tournamentId && (
            <Button
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold font-mono"
              onClick={() => (window.location.href = `/tournaments/${tournamentId}`)}
            >
              <Icon name="Swords" className="mr-2 h-5 w-5" />
              СРАЗИТЬСЯ!
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10 font-bold font-mono"
            onClick={() => (window.location.href = `/news/${slug}`)}
          >
            ЧИТАТЬ ДАЛЕЕ
            <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}