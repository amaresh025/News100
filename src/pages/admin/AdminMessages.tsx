import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';

interface M { id: string; name: string; email: string; subject: string | null; message: string; is_read: boolean; created_at: string; }

export default function AdminMessages() {
  const [rows, setRows] = useState<M[]>([]);
  const load = () => supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows((data as M[]) ?? []));
  useEffect(() => { load(); }, []);

  const read = async (id: string) => { await supabase.from('contact_messages').update({ is_read: true }).eq('id', id); load(); };
  const del = async (id: string) => { if (confirm('Delete message?')) { await supabase.from('contact_messages').delete().eq('id', id); load(); } };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-extrabold mb-6">Contact Messages</h1>
      <div className="space-y-3">
        {rows.map(m => (
          <div key={m.id} className={`bg-card border rounded-lg p-4 ${m.is_read ? 'border-border opacity-70' : 'border-primary/40'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">
                <span className="font-semibold">{m.name}</span>
                <span className="text-muted-foreground"> · {m.email}</span>
                <span className="text-muted-foreground"> · {new Date(m.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex gap-2">
                {!m.is_read && <Button size="sm" variant="outline" onClick={() => read(m.id)}><Check className="h-3 w-3 mr-1" />Mark read</Button>}
                <Button size="sm" variant="outline" onClick={() => del(m.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            {m.subject && <p className="font-medium mb-1">{m.subject}</p>}
            <p className="text-sm whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No messages.</p>}
      </div>
    </AdminLayout>
  );
}
