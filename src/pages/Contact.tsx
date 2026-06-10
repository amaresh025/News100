import { useState } from 'react';
import { z } from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(5, 'Message is too short').max(2000),
  honey: z.string().max(0, 'spam').optional(),
});

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', honey: '' });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: 'Please check the form', description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    if (parsed.data.honey) return; // anti-spam
    setBusy(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name, email: parsed.data.email,
      subject: parsed.data.subject, message: parsed.data.message,
    });
    setBusy(false);
    if (error) {
      toast({ title: 'Could not send', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Message sent!', description: 'Thanks — our team will get back to you.' });
    setForm({ name: '', email: '', subject: '', message: '', honey: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container-blog py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Contact News100</h1>
            <p className="text-lg text-muted-foreground">Tips, feedback, or partnership enquiries — we'd love to hear from you.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Send us a message</CardTitle>
                <CardDescription>We typically respond within 1–2 business days.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <input type="text" value={form.honey} onChange={e => setForm(f => ({ ...f, honey: e.target.value }))}
                    tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="name">Name *</Label>
                      <Input id="name" required maxLength={100} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required maxLength={255} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" required maxLength={200} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
                  <div className="space-y-2"><Label htmlFor="message">Message *</Label>
                    <Textarea id="message" rows={6} required maxLength={2000} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
                  <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                    {busy ? 'Sending…' : <><Send className="h-4 w-4 mr-2" />Send Message</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Direct contact</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Editorial:</strong><br /><a href="mailto:contact@news100.in" className="text-primary">contact@news100.in</a></p>
                <p><strong>Press releases:</strong><br /><a href="mailto:press@news100.in" className="text-primary">press@news100.in</a></p>
                <p className="text-muted-foreground pt-3 border-t">News100 — India's Latest News, Fast &amp; Reliable.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
