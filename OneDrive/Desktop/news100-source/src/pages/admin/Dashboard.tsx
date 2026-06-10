import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Mail, FolderTree, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, comments: 0, messages: 0, categories: 0 });

  useEffect(() => {
    (async () => {
      const [p, c, m, cat] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        posts: p.count ?? 0, comments: c.count ?? 0,
        messages: m.count ?? 0, categories: cat.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: 'Total Posts', value: stats.posts, icon: FileText, to: '/admin/posts' },
    { label: 'Categories', value: stats.categories, icon: FolderTree, to: '/admin/categories' },
    { label: 'Comments', value: stats.comments, icon: MessageSquare, to: '/admin/comments' },
    { label: 'Messages', value: stats.messages, icon: Mail, to: '/admin/messages' },
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <Button asChild><Link to="/admin/posts/new"><Plus className="h-4 w-4 mr-2" />New Post</Link></Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link to={c.to} key={c.label}>
            <Card className="hover:border-primary/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-3xl font-extrabold">{c.value}</div></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
