import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { PostRow, formatDate } from '@/hooks/usePosts';

interface NewsCardProps {
  post: PostRow;
  size?: 'sm' | 'md' | 'lg';
}

const NewsCard = ({ post, size = 'md' }: NewsCardProps) => {
  const isLg = size === 'lg';
  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md hover:border-primary/40 transition-all">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className={`overflow-hidden ${isLg ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
          <img
            src={post.featured_image ?? ''}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className={`p-4 space-y-2 ${isLg ? 'md:p-5' : ''}`}>
          <div className="flex items-center gap-2">
            {post.categories && <span className="badge-category">{post.categories.name}</span>}
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDate(post.published_at)}
            </span>
          </div>
          <h3 className={`font-bold leading-snug line-clamp-3 group-hover:text-primary transition-colors ${isLg ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}>
            {post.title}
          </h3>
          {isLg && post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          )}
        </div>
      </Link>
    </article>
  );
};

export default NewsCard;
