import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Row { id: string; title: string; slug: string; status: string; published_at: string | null; views: number; }

export default function AdminPosts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('posts')
      .select('id,title,slug,status,published_at,views').order('created_at', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); load(); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Posts</h1>
        <Button asChild><Link to="/admin/posts/new"><Plus className="h-4 w-4 mr-2" />New Post</Link></Button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[500px] md:min-w-full">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3 w-24">Status</th>
              <th className="p-3 w-20 hidden sm:table-cell">Views</th>
              <th className="p-3 w-36 hidden md:table-cell">Published</th>
              <th className="p-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No posts yet.</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium line-clamp-2 md:line-clamp-none">{r.title}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${r.status === 'published' ? 'bg-primary/15 text-primary' : 'bg-muted-foreground/15 text-muted-foreground'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 hidden sm:table-cell">{r.views.toLocaleString('en-IN')}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{r.published_at ? new Date(r.published_at).toLocaleDateString('en-IN') : '—'}</td>
                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                  <Button asChild size="sm" variant="outline"><Link to={`/admin/posts/${r.id}`}><Pencil className="h-3 w-3" /></Link></Button>
                  <Button size="sm" variant="outline" onClick={() => del(r.id)}><Trash2 className="h-3 w-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
