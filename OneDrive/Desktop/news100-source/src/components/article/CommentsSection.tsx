import { useEffect, useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';

interface PubC { id: string; name: string; content: string; created_at: string; }
const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  content: z.string().trim().min(2).max(1000),
});

export default function CommentsSection({ postId }: { postId: string }) {
  const [rows, setRows] = useState<PubC[]>([]);
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = () => supabase.from('public_comments').select('*').eq('post_id', postId)
    .order('created_at', { ascending: false }).then(({ data }) => setRows((data as PubC[]) ?? []));
  useEffect(() => { load(); }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return toast({ title: p.error.issues[0].message, variant: 'destructive' });
    setBusy(true);
    const { error } = await supabase.from('comments').insert({ post_id: postId, approved: false, ...p.data });
    setBusy(false);
    if (error) return toast({ title: 'Failed to post', description: error.message, variant: 'destructive' });
    toast({ title: 'Thanks! Your comment is awaiting moderation.' });
    setForm({ name: '', email: '', content: '' });
  };

  return (
    <section className="mt-12 space-y-6">
      <h2 className="text-2xl font-extrabold flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments ({rows.length})</h2>

      <form onSubmit={submit} className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Name *</Label><Input value={form.name} maxLength={80} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label>Email *</Label><Input type="email" value={form.email} maxLength={200} required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        </div>
        <div><Label>Comment *</Label><Textarea rows={3} maxLength={1000} value={form.content} required onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
        <Button type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post Comment'}</Button>
        <p className="text-xs text-muted-foreground">Your email is kept private and never shown publicly.</p>
      </form>

      <div className="space-y-3">
        {rows.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1 text-sm">
              <span className="font-semibold">{c.name}</span>
              <span className="text-muted-foreground">· {new Date(c.created_at).toLocaleDateString('en-IN')}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Be the first to comment.</p>}
      </div>
    </section>
  );
}
