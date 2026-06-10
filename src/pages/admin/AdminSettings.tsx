import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const KEYS = [
  ['site_title', 'Site Title'],
  ['tagline', 'Tagline'],
  ['logo_url', 'Logo URL'],
  ['footer_text', 'Footer Text'],
  ['contact_email', 'Contact Email (private)'],
  ['social_facebook', 'Facebook URL'],
  ['social_twitter', 'Twitter / X URL'],
  ['social_instagram', 'Instagram URL'],
  ['social_youtube', 'YouTube URL'],
] as const;

export default function AdminSettings() {
  const [vals, setVals] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      const o: Record<string, string> = {};
      (data ?? []).forEach((r: { key: string; value: unknown }) => {
        o[r.key] = typeof r.value === 'string' ? r.value : (r.value as { value?: string } | undefined)?.value ?? '';
      });
      setVals(o);
    });
  }, []);

  const save = async (key: string) => {
    const { error } = await supabase.from('site_settings').upsert({ key, value: vals[key] ?? '' });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Saved' });
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-extrabold mb-6">Site Settings</h1>
      <div className="space-y-4 max-w-2xl">
        {KEYS.map(([key, label]) => (
          <div key={key} className="bg-card border border-border rounded-lg p-4 space-y-2">
            <Label>{label}</Label>
            {key === 'footer_text' ? (
              <Textarea rows={3} value={vals[key] ?? ''} onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))} />
            ) : (
              <Input value={vals[key] ?? ''} onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))} />
            )}
            <Button size="sm" onClick={() => save(key)}>Save</Button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
