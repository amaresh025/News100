import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Cat { id: string; name: string; slug: string; }
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

export default function AdminCategories() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState('');
  const { toast } = useToast();

  const load = () => supabase.from('categories').select('id,name,slug').order('name').then(({ data }) => setCats(data ?? []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from('categories').insert({ name: name.trim(), slug: slugify(name) });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { setName(''); load(); }
  };
  const del = async (id: string) => {
    if (!confirm('Delete category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else load();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-extrabold mb-6">Categories</h1>
      <div className="flex gap-2 mb-6 max-w-md">
        <Input placeholder="Category name" value={name} onChange={e => setName(e.target.value)} />
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden max-w-2xl">
        {cats.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
            <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.slug}</div></div>
            <Button size="sm" variant="outline" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
        {cats.length === 0 && <div className="p-6 text-center text-muted-foreground">No categories</div>}
      </div>
    </AdminLayout>
  );
}
