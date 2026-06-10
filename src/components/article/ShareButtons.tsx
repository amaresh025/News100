import { Facebook, Twitter, Send } from 'lucide-react';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = encodeURIComponent(title), u = encodeURIComponent(url);
  const items = [
    { label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: 'X', icon: Twitter, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: 'WhatsApp', icon: Send, href: `https://api.whatsapp.com/send?text=${t}%20${u}` },
    { label: 'Telegram', icon: Send, href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground">Share:</span>
      {items.map(i => (
        <a key={i.label} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${i.label}`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
          <i.icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
