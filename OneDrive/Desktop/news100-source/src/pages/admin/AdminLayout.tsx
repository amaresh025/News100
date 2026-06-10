import { ReactNode, useState } from 'react';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderTree, MessageSquare, Mail, Settings, LogOut, Menu } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/posts', icon: FileText, label: 'Posts' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/comments', icon: MessageSquare, label: 'Comments' },
  { to: '/admin/messages', icon: Mail, label: 'Messages' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading, user } = useIsAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading admin…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="text-muted-foreground">Your account is not an administrator.</p>
        <Button onClick={async () => { await supabase.auth.signOut(); navigate('/admin/login'); }}>Sign out</Button>
      </div>
    );
  }

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full bg-card">
      <Link to="/" className="px-5 h-16 flex items-center border-b border-border">
        <span className="text-xl font-extrabold">News<span className="text-primary">100</span></span>
        <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
      </Link>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to} to={l.to} end={l.end}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              }`}
          >
            <l.icon className="h-4 w-4" /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
        <Button variant="outline" size="sm" className="w-full"
          onClick={async () => { await supabase.auth.signOut(); navigate('/admin/login'); }}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Mobile Sticky Header */}
      <header className="flex md:hidden h-16 items-center justify-between px-4 border-b border-border bg-card sticky top-0 z-40">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-extrabold">News<span className="text-primary">100</span></span>
          <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60 border-r-0">
            <SidebarContent onItemClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-card border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
