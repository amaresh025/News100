import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const upload = async (file: File) => {
    if (!ACCEPT.includes(file.type)) return toast({ title: 'Only JPG, PNG, WEBP allowed', variant: 'destructive' });
    if (file.size > MAX_BYTES) return toast({ title: 'Max file size 5 MB', variant: 'destructive' });
    setBusy(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('featured-images').upload(path, file, { contentType: file.type });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setBusy(false); return; }
    const { data } = supabase.storage.from('featured-images').getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="max-h-48 rounded border border-border" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        <Button type="button" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />{busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WEBP. Max 5 MB. Or paste a URL below.</p>
      </div>
    </div>
  );
}
