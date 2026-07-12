import { Link, NavLink } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  HandHeart,
  ShieldCheck,
  Trophy,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/environmental', label: 'Environmental', icon: Leaf, adminOnly: true },
  { to: '/social', label: 'Social', icon: HandHeart, adminOnly: false },
  { to: '/governance', label: 'Governance', icon: ShieldCheck, adminOnly: false },
  { to: '/gamification', label: 'Gamification', icon: Trophy, adminOnly: false },
  { to: '/team', label: 'Team', icon: Users, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

const initials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const AppLayout = ({ children }) => {
  const { user, organization, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas md:flex">
      <aside className="flex flex-col border-r border-border-subtle bg-surface md:w-64 md:shrink-0">
        <Link to="/" className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-canvas">
            <Leaf size={18} strokeWidth={2.5} />
          </span>
          <span className="font-heading text-lg font-bold text-ink-50">EcoSphere</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-ink-300 hover:bg-white/5 hover:text-ink-50'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-border-subtle px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/15 text-xs font-bold text-primary-400">
              {initials(user?.name || user?.username)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink-50">
                {user?.name ?? user?.username}
              </div>
              <div className="truncate text-xs text-ink-400">
                {organization?.name}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-400 transition-colors hover:bg-white/5 hover:text-danger-400"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
};

export default AppLayout;
