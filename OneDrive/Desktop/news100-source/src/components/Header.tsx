import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Facebook, Twitter, Instagram, Menu, X, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Latest News', href: '/latest' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'India', href: '/category/india' },
  { name: 'Business', href: '/category/business' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Technology', href: '/category/technology' },
  { name: 'Health', href: '/category/health' },
  { name: 'Contact', href: '/contact' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter / X' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      {/* Top utility bar */}
      <div className="hidden md:block bg-foreground text-background text-xs">
        <div className="container-blog flex items-center justify-between h-8">
          <span className="opacity-80">{today} · New Delhi</span>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} className="opacity-80 hover:opacity-100 transition-opacity">
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
            <span className="opacity-50">|</span>
            <a href="mailto:contact@news100.in" className="opacity-80 hover:opacity-100">contact@news100.in</a>
          </div>
        </div>
      </div>

      <div className="container-blog">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="News100 home">
            <span className="inline-flex items-baseline">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">News</span>
              <span className="text-3xl font-extrabold tracking-tight text-primary">100</span>
            </span>
            <span className="hidden lg:inline text-[10px] uppercase tracking-widest text-muted-foreground border-l border-border pl-2 ml-1">
              India's Latest News
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" aria-label="Search articles" onClick={() => navigate('/search')}>
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:block border-t border-border" role="navigation" aria-label="Main navigation">
          <ul className="flex items-center gap-1 -mx-2 overflow-x-auto">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `nav-link block py-3 ${isActive ? 'text-primary border-b-2 border-primary' : ''}`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <nav className="flex flex-col" role="navigation" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `py-2 px-2 text-sm font-semibold uppercase tracking-wide ${isActive ? 'text-primary' : 'text-foreground'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
