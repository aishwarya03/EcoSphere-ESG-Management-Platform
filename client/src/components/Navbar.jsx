import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/useAuth';
import { useAuthCta } from '../hooks/useAuthCta';

const links = [
  { href: '#pillars', label: 'Modules' },
  { href: '#gamification', label: 'Gamification' },
  { href: '#journey', label: 'How it works' },
];

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const cta = useAuthCta();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border-subtle bg-canvas/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-canvas shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)]">
            <Leaf size={18} strokeWidth={2.5} />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-ink-50">
            EcoSphere
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-200 transition-colors hover:text-primary-400"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="hidden text-sm font-medium text-ink-200 transition-colors hover:text-primary-400 sm:block"
            >
              Sign in
            </Link>
          )}
          <Button as={Link} to={cta.to} size="sm" variant="primary">
            {cta.label}
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
