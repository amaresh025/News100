import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface C { id: string; name: string; email: string; content: string; approved: boolean; created_at: string; post_id: string; }

export default function AdminComments() {
  const [rows, setRows] = useState<C[]>([]);
  const { toast } = useToast();
  const load = () => supabase.from('comments').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows((data as C[]) ?? []));
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    await supabase.from('comments').update({ approved: true }).eq('id', id);
    toast({ title: 'Approved' }); load();
  };
  const del = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await supabase.from('comments').delete().eq('id', id);
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-extrabold mb-6">Comments</h1>
      <div className="space-y-3">
        {rows.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">
                <span className="font-semibold">{c.name}</span>
                <span className="text-muted-foreground"> · {c.email}</span>
                <span className="text-muted-foreground"> · {new Date(c.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2">
                {!c.approved && <Button size="sm" onClick={() => approve(c.id)}><Check className="h-3 w-3 mr-1" />Approve</Button>}
                {c.approved && <span className="text-xs px-2 py-1 bg-primary/15 text-primary rounded">Approved</span>}
                <Button size="sm" variant="outline" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <p className="text-sm">{c.content}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No comments yet.</p>}
      </div>
    </AdminLayout>
  );
}
