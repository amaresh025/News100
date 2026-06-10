import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getVisitorId } from '@/lib/visitorId';
import { useToast } from '@/hooks/use-toast';

export default function LikeButton({ postId }: { postId: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  const visitorId = getVisitorId();

  useEffect(() => {
    (async () => {
      const { count: c } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
      setCount(c ?? 0);
      const { data } = await supabase.from('post_likes').select('id').eq('post_id', postId).eq('visitor_id', visitorId).maybeSingle();
      setLiked(!!data);
    })();
  }, [postId, visitorId]);

  const like = async () => {
    if (liked) return;
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, visitor_id: visitorId });
    if (error) { toast({ title: 'Already liked', variant: 'destructive' }); return; }
    setLiked(true); setCount(c => c + 1);
  };

  return (
    <button onClick={like} disabled={liked}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        liked ? 'bg-destructive/10 border-destructive text-destructive' : 'border-border hover:border-destructive'
      }`}>
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      <span className="text-sm font-semibold">{count} {count === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}
